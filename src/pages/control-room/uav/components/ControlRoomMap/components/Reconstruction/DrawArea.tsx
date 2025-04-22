import useMapDrawStore, {
  CotType,
  DrawType,
  drawingMitt,
} from '@/store/map/useDraw.store'
import { useBoolean } from 'ahooks'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import ReconstructionSettingModal from './SettingModal'
import { getHexWithAlpha, hexToARGB } from '@/utils/other/utils'
import ReconstructionAreaPrimitive from './ReconstructionAreaPrimitive'
import { useAppMsg } from '@/hooks/useAppMsg'
import {
  createLayer,
  startReconstructionTask,
} from '@/service/modules/reconstruction'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { reconstructionMitt } from '@/store/map/useReconstructionMap.store'

type FlyOptions = {
  flightAltitude: number
  overlapRate: number
  returnAltitude: number
  taskCompletionAction: 'GO_HOME' | 'HOVER'
}

type PropsType = {
  setState: (
    state:
      | 'drawing'
      | 'setting'
      | 'error_max'
      | 'error_min'
      | 'reconstructing'
      | 'reconstruction_end',
  ) => void
  MAX_RADIUS: number
  MIN_RADIUS: number
}

const DrawArea: FC<PropsType> = memo(({ setState, MAX_RADIUS, MIN_RADIUS }) => {
  const { viewer } = useCesium()
  const msgApi = useAppMsg()
  const { t } = useTranslation()

  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const circleCenter = useRef<Cesium.Cartesian3 | null>(null)
  const endPoint = useRef<Cesium.Cartesian3 | null>(null)

  const [open, { setTrue, setFalse }] = useBoolean(false)

  const drawingColor = useMapDrawStore((s) => s.drawingColor)
  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)
  const quitRecontructionArea = useMapDrawStore((s) => s.quitRecontructionArea)

  const areaPrimitiveRef = useRef<ReconstructionAreaPrimitive | null>(null)
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null)

  // 初始化绘制
  useEffect(() => {
    if (!viewer) {
      return
    }

    updateDrawing(DrawType.ReconstructionArea)
    handlerRef.current = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    areaPrimitiveRef.current = new ReconstructionAreaPrimitive(drawingColor)
    viewer?.scene.primitives.add(areaPrimitiveRef.current)

    // 监听绘制面积变化
    areaPrimitiveRef.current.onChange = (_area, radius) => {
      if (radius > MAX_RADIUS) {
        setState('error_max')
      } else if (radius < MIN_RADIUS) {
        setState('error_min')
      } else {
        setState('drawing')
      }
    }
    drawingMitt.on('reconstruction-to-other', () => {
      msgApi.error('请先完成或取消三维重建规划才能进行测量绘制操作')
    })

    return () => {
      viewer?.scene.primitives.remove(areaPrimitiveRef.current)
      handlerRef.current &&
        (handlerRef.current.destroy(), (handlerRef.current = null))
      quitRecontructionArea()
      drawingMitt.off('reconstruction-to-other')
      updateDrawing(DrawType.None)
    }
  }, [viewer])

  // 地图交互
  useEffect(() => {
    if (!viewer || !handlerRef.current) {
      return
    }

    // 打开设置面板就关闭绘制
    if (open) {
      handlerRef.current.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      )
      handlerRef.current.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE,
      )
      handlerRef.current.removeInputAction(
        Cesium.ScreenSpaceEventType.RIGHT_CLICK,
      )
    } else {
      // 左键 选点
      handlerRef.current.setInputAction((e) => {
        if (circleCenter.current) {
          return
        }

        const ray = viewer.camera.getPickRay(e.position)
        if (!ray) return
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!cartesian) return
        circleCenter.current = cartesian
        if (endPoint.current && areaPrimitiveRef.current) {
          areaPrimitiveRef.current.positions = [
            circleCenter.current,
            endPoint.current || circleCenter.current,
          ]
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      // 移动
      handlerRef.current.setInputAction((e) => {
        if (!circleCenter.current) {
          return
        }

        const ray = viewer.camera.getPickRay(e.endPosition)
        if (!ray) return
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!cartesian) return
        endPoint.current = cartesian
        if (endPoint.current && areaPrimitiveRef.current) {
          areaPrimitiveRef.current.positions = [
            circleCenter.current,
            endPoint.current,
          ]
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      // 右键结束
      handlerRef.current.setInputAction(() => {
        if (areaPrimitiveRef.current!.radius > MAX_RADIUS) {
          msgApi.error(t('controlRoom.uav.service.reconstruction.error_max'))
          setState('drawing')
          circleCenter.current = null
          endPoint.current = null
          areaPrimitiveRef.current && (areaPrimitiveRef.current.positions = [])
        } else if (
          areaPrimitiveRef.current!.radius < MIN_RADIUS ||
          areaPrimitiveRef.current?.area === 0
        ) {
          msgApi.error(t('controlRoom.uav.service.reconstruction.error_min'))
          setState('drawing')
          circleCenter.current = null
          endPoint.current = null
          areaPrimitiveRef.current && (areaPrimitiveRef.current.positions = [])
        } else {
          handlerRef.current?.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_CLICK,
          )
          handlerRef.current?.removeInputAction(
            Cesium.ScreenSpaceEventType.MOUSE_MOVE,
          )
          handlerRef.current?.removeInputAction(
            Cesium.ScreenSpaceEventType.RIGHT_CLICK,
          )
          setTrue()
          setState('setting')
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    return () => {
      updateDrawing(DrawType.None)
      handlerRef.current?.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      )
      handlerRef.current?.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE,
      )
      handlerRef.current?.removeInputAction(
        Cesium.ScreenSpaceEventType.RIGHT_CLICK,
      )
    }
  }, [viewer, open])

  const handleConfirm = async (flyOptions: FlyOptions) => {
    areaPrimitiveRef.current?.complete()

    const strokeColorHex = getHexWithAlpha(drawingColor, 1)
    const strokeColorARGB = hexToARGB(strokeColorHex)
    const fillColorHex = getHexWithAlpha(drawingColor, 0.5)
    const fillColorARGB = hexToARGB(fillColorHex)

    const circleCarto = Cesium.Cartographic.fromCartesian(circleCenter.current!)
    const x = Cesium.Math.toDegrees(circleCarto.longitude)
    const y = Cesium.Math.toDegrees(circleCarto.latitude)
    const circleCenterCoord = [x, y]

    const createLayerData = {
      overlayType: 'CIRCULAR',
      overlayPositions: JSON.stringify([
        [...circleCenterCoord, 0, areaPrimitiveRef.current!.radius],
      ]),
      overlayBindType: 'NORMAL',
      overlayStyleConfig: JSON.stringify({
        strokeColor: {
          '-value': `${strokeColorARGB}`, //描边颜色（argb）
        },
        strokeWeight: {
          '-value': '4.0', //描边宽度
        },
        strokeStyle: {
          '-value': 'solid', //描边样式(solid:实线;dashed:虚线;dotted:斑点线,outlined:轮廓线)
        },
        fillColor: {
          '-value': `${fillColorARGB}`, //填充色（argb）
        },
        labels_on: {
          '-value': 'false', //是否显示标签
        },
        height: {
          '-value': '2.0', //高度
        },
        color: {
          '-value': '-1', //颜色,先默认-1
        },
        remarks: '',
      }),
      cotType: CotType.SHAPE_CIRCLE,
    }

    try {
      setFalse()
      if (handlerRef.current) {
        handlerRef.current.removeInputAction(
          Cesium.ScreenSpaceEventType.RIGHT_CLICK,
        )
        handlerRef.current.removeInputAction(
          Cesium.ScreenSpaceEventType.MOUSE_MOVE,
        )
        handlerRef.current.removeInputAction(
          Cesium.ScreenSpaceEventType.LEFT_CLICK,
        )
      }

      const data = await createLayer(createLayerData)
      const overlayId = data.data.overlayId
      await startReconstructionTask({
        overlayId,
        deviceId,
        ...flyOptions,
      })
      setState('reconstructing')
      quitRecontructionArea()
      reconstructionMitt.on('reconstructionTaskEnd', (oid: number) => {
        if (oid === overlayId) {
          setState('reconstruction_end')
          const areaLabel = areaPrimitiveRef.current?.getAreaLabel()
          areaLabel &&
            (areaLabel.text = t('mapLayer.reconstructionMap.task.completed'))
        }
      })
    } catch (error) {
      setState('drawing')
    } finally {
      setFalse()
    }
  }

  return (
    <ReconstructionSettingModal
      open={open}
      onClose={() => {
        setFalse()
        circleCenter.current = null
        endPoint.current = null
        areaPrimitiveRef.current && (areaPrimitiveRef.current.positions = [])
        setState('drawing')
      }}
      onConfirm={handleConfirm}
    />
  )
})

DrawArea.displayName = 'DrawArea'

export default DrawArea
