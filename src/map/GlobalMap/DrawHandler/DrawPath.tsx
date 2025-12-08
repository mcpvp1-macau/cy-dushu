import useMapDrawStore, { CotType, DrawType } from '@/store/map/useDraw.store'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { useBoolean, useLatest } from 'ahooks'
import { PointPrimitiveCollection, useCesium } from 'resium'
import * as Cesium from 'cesium'
import AddFormModal from './components/AddFormModal'
import { getHexWithAlpha, hexToARGB } from '@/utils/other/utils'
import OverlayPath from '@/map/CesiumMap/components/service/Overlaies/OverlayPath'
import { round } from 'lodash'
import useCreateFn from './hooks/useCreateFn'
import { useAppMsg } from '@/hooks/useAppMsg'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'

type PropsType = {
  onSuccess?: () => void
}

/** 绘制路径 */
const DrawPath: FC<PropsType> = memo(({ onSuccess }) => {
  const { viewer } = useCesium()

  const [paths, setPaths] = useState<number[][]>([])
  const latestPaths = useLatest(paths)
  const [endPoint, setEndPoint] = useState<number[] | null>(null)

  const [open, { setTrue, setFalse }] = useBoolean(false)

  const drawingColor = useMapDrawStore((s) => s.drawingColor)
  const lineStyle = useMapDrawStore((s) => s.lineStyle)

  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)

  const updateRightMode = useRightMode((s) => s.updateRightMode)

  const createFn = useCreateFn()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    // 左键 选点
    handler.setInputAction((e) => {
      const ray = viewer.camera.getPickRay(e.position)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      const geo = cartesian3ToDegrees(cartesian)
      setPaths((prev) => [...prev, [geo[0], geo[1], round(geo[2], 2)]])
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

    handler.setInputAction((e) => {
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) {
        setEndPoint(null)
        return
      }
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) {
        setEndPoint(null)
        return
      }
      // 地形上的点
      const geo = cartesian3ToDegrees(cartesian)
      setEndPoint([geo[0], geo[1], round(geo[2], 2)])
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 右键 结束绘制

    handler.setInputAction((_e) => {
      if (latestPaths.current.length >= 2) {
        setTrue()
      } else {
        msgApi.error('请至少绘制两个点！')
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    viewer.scene.screenSpaceCameraController.enableRotate = false
    return () => {
      handler.destroy()
      viewer.scene.screenSpaceCameraController.enableRotate = true
    }
  }, [viewer])

  const msgApi = useAppMsg()

  const handleConfirm = async (data: any) => {
    console.log('handleConfirm', paths, endPoint)
    if (paths.length < 2) {
      msgApi.error('请至少绘制两个点！')
      return
    }

    const commitPath = [...paths]

    const strokeColorHex = getHexWithAlpha(drawingColor, 1)
    const strokeColorARGB = hexToARGB(strokeColorHex)

    const commitData = {
      layerId: data.layerId,
      overlayName: data.overlayName,
      overlayType: 'LINE',
      overlayPositions: JSON.stringify(commitPath),
      overlayBindType: 'NORMAL',
      overlayStyleConfig: JSON.stringify({
        contact: {
          '-callsign': data.overlayName, //路径名称
        },
        strokeColor: {
          '-value': `${strokeColorARGB}`, //线颜色（argb）
        },
        strokeWeight: {
          '-value': '2.0', //线宽度
        },
        strokeStyle: {
          '-value': `${lineStyle}`, //线样式(solid:实线;dashed:虚线;dotted:斑点线,outlined:轮廓线)
        },
        color: {
          '-value': '-1', //颜色,先默认-1
        },
        remarks: '',
      }),
      cotType: CotType.LINE_LUJING,
    }
    await createFn(commitData)
    await onSuccess?.()
    setFalse()
    updateDrawing(DrawType.None)
    updateRightMode(RightModeEnum.HIDE)
  }

  const handleClose = () => {
    setFalse()
    setPaths([])
    setEndPoint(null)
    updateDrawing(DrawType.None)
    updateRightMode(RightModeEnum.HIDE)
  }

  const positions = useMemo(() => {
    if (!endPoint || paths.length < 1) {
      return paths
    }
    return [...paths, endPoint]
  }, [paths, endPoint])

  return (
    <>
      <AddFormModal
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
      <PointPrimitiveCollection>
        {positions && viewer && positions.length >= 2 && (
          <OverlayPath
            data={''}
            primitives={viewer.scene.primitives}
            isGround={true}
            path={positions}
            asynchronous={false}
            stroke={drawingColor}
            strokeStyle={lineStyle}
            strokeWeight={2}
            showPoints={true}
          />
        )}
      </PointPrimitiveCollection>
    </>
  )
})

DrawPath.displayName = 'DrawPath'

export default DrawPath
