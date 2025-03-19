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

type FlyOptions = {
  flightAltitude: number
  overlapRate: number
  returnAltitude: number
  taskCompletionAction: 'goBack' | 'hover'
}

type PropsType = {
  setState: (
    state: 'drawing' | 'setting' | 'error_max' | 'reconstructing',
  ) => void
  MAX_AREA: number
}

const DrawArea: FC<PropsType> = memo(({ setState, MAX_AREA }) => {
  const { viewer } = useCesium()
  const msgApi = useAppMsg()

  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  /** 支点 */
  const paths = useRef<Cesium.Cartesian3[]>([])
  const endPoint = useRef<Cesium.Cartesian3 | null>(null)

  const [open, { setTrue, setFalse }] = useBoolean(false)

  const drawingColor = useMapDrawStore((s) => s.drawingColor)
  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)
  const quitRecontructionArea = useMapDrawStore((s) => s.quitRecontructionArea)

  const areaPrimitiveRef = useRef<ReconstructionAreaPrimitive | null>(null)
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null)

  // 地图交互
  useEffect(() => {
    if (!viewer) {
      return
    }
    updateDrawing(DrawType.ReconstructionArea)
    drawingMitt.on('reconstruction-to-other', () => {
      msgApi.error('请先完成或取消三维重建规划才能进行测量绘制操作')
    })

    handlerRef.current = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    areaPrimitiveRef.current = new ReconstructionAreaPrimitive(drawingColor)
    viewer?.scene.primitives.add(areaPrimitiveRef.current)

    // 监听绘制面积变化
    areaPrimitiveRef.current.onAreaChanged = (area) => {
      if (area > MAX_AREA) {
        setState('error_max')
      } else {
        setState('drawing')
      }
    }

    // 左键 选点
    handlerRef.current.setInputAction((e) => {
      const ray = viewer.camera.getPickRay(e.position)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      paths.current.push(cartesian)
      if (endPoint.current && areaPrimitiveRef.current) {
        areaPrimitiveRef.current.positions = [
          ...paths.current,
          endPoint.current,
        ]
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 移动
    handlerRef.current.setInputAction((e) => {
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      endPoint.current = cartesian
      if (endPoint.current && areaPrimitiveRef.current) {
        areaPrimitiveRef.current.positions = [
          ...paths.current,
          endPoint.current,
        ]
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 右键结束
    handlerRef.current.setInputAction(() => {
      if (areaPrimitiveRef.current!.area > MAX_AREA) {
        msgApi.error('规划区域过大，请重新绘制')
        setState('drawing')
        paths.current = []
        endPoint.current = null
        areaPrimitiveRef.current && (areaPrimitiveRef.current.positions = [])
        return
      }
      if (paths.current.length >= 2) {
        setTrue()
        setState('setting')
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    return () => {
      viewer?.scene.primitives.remove(areaPrimitiveRef.current)
      handlerRef.current &&
        (handlerRef.current.destroy(), (handlerRef.current = null))
      quitRecontructionArea()
      drawingMitt.off('reconstruction-to-other')
    }
  }, [viewer])

  const handleConfirm = async (flyOptions: FlyOptions) => {
    if (paths.current.length < 2) {
      return
    }
    areaPrimitiveRef.current?.complete()

    const strokeColorHex = getHexWithAlpha(drawingColor, 1)
    const strokeColorARGB = hexToARGB(strokeColorHex)
    const fillColorHex = getHexWithAlpha(drawingColor, 0.5)
    const fillColorARGB = hexToARGB(fillColorHex)

    const createLayerData = {
      overlayType: 'POLYGON',
      overlayPositions: JSON.stringify([...paths.current, endPoint.current]),
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
      cotType: CotType.SHAPE_POLYGON,
    }

    try {
      const data = await createLayer(createLayerData)
      const overlayId = data.data.overlayId
      // await startReconstructionTask({
      //   overlayId,
      //   deviceId,
      //   ...flyOptions,
      // })
      msgApi.success(`开始重建，区域id为${overlayId}`)
      setState('reconstructing')
      quitRecontructionArea()
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
        paths.current = []
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
