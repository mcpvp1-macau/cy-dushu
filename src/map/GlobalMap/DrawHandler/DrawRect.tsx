import useMapDrawStore, { CotType } from '@/store/map/useDraw.store'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { useBoolean, useLatest } from 'ahooks'
import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import AddFormModal from './components/AddFormModal'
import { getHexWithAlpha, hexToARGB } from '@/utils/other/utils'
import { createOverlay } from '@/service/modules/layer_overlay'
import DrawingPolygon from './components/DrawingPolygon'

type PropsType = {
  onSuccess?: () => void
}

const DrawRect: FC<PropsType> = memo(({ onSuccess }) => {
  const { viewer } = useCesium()
  /** 支点 */
  const [pivot, setPivot] = useState<number[] | null>(null)
  const latestPivot = useLatest(pivot)
  const [endPoint, setEndPoint] = useState<number[] | null>(null)
  const latestEndPoint = useLatest(endPoint)

  const [open, { setTrue, setFalse }] = useBoolean(false)

  const drawingColor = useMapDrawStore((s) => s.drawingColor)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    // 左键 选点
    handler.setInputAction((e) => {
      if (pivot) {
        return
      }
      const ray = viewer.camera.getPickRay(e.position)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      // pivot.current = cartesian3ToDegrees(cartesian)
      // endPoint.current = cartesian3ToDegrees(cartesian)
      setPivot(cartesian3ToDegrees(cartesian))
      setEndPoint(cartesian3ToDegrees(cartesian))
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 移动
    handler.setInputAction((e) => {
      if (!latestPivot.current) {
        return
      }
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      const geo = cartesian3ToDegrees(cartesian)
      // endPoint.current = geo
      setEndPoint(geo)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 右键结束
    handler.setInputAction(() => {
      if (latestPivot.current && latestEndPoint.current) {
        setTrue()
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [viewer])

  const handleConfirm = async (data: any) => {
    if (!pivot || !endPoint) {
      return
    }

    const strokeColorHex = getHexWithAlpha(drawingColor, 1)
    const strokeColorARGB = hexToARGB(strokeColorHex)
    const fillColorHex = getHexWithAlpha(drawingColor, 0.5)
    const fillColorARGB = hexToARGB(fillColorHex)

    const commitData = {
      layerId: data.layerId,
      overlayName: data.overlayName,
      overlayType: 'POLYGON',
      overlayPositions: JSON.stringify([
        pivot,
        [pivot[0], endPoint[1]],
        endPoint,
        [endPoint[0], pivot[1]],
      ]),
      overlayBindType: 'NORMAL',
      overlayStyleConfig: JSON.stringify({
        contact: {
          '-callsign': data.overlayName, //多边形名称
        },
        strokeColor: {
          '-value': `${strokeColorARGB}`, //描边颜色（argb）
        },
        strokeWeight: {
          '-value': '2.0', //描边宽度
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
    await createOverlay(commitData)
    onSuccess?.()
    setFalse()
  }

  const positions = useMemo(() => {
    if (!endPoint || !pivot) {
      return null
    }
    return [
      pivot,
      [pivot[0], endPoint[1]],
      endPoint,
      [endPoint[0], pivot[1]],
      pivot,
    ]
  }, [pivot, endPoint])

  return (
    <>
      <AddFormModal
        open={open}
        onClose={() => {
          setFalse()
          setPivot(null)
          setEndPoint(null)
        }}
        onConfirm={handleConfirm}
      />
      {positions && (
        <DrawingPolygon positions={positions} color={drawingColor} />
      )}
    </>
  )
})

DrawRect.displayName = 'DrawRect'

export default DrawRect
