import useMapDrawStore, { CotType } from '@/store/map/useDraw.store'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { useBoolean, useLatest } from 'ahooks'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import AddFormModal from './components/AddFormModal'
import { getHexWithAlpha, hexToARGB } from '@/utils/other/utils'
import { createOverlay } from '@/service/modules/layer_overlay'
import OverlayPolygon from '@/map/CesiumMap/components/service/Overlaies/OverlayPolygon'
import { round } from 'lodash'
import AddFlightAreaModal from './components/AddFlightAreaModal'
import { createFlightArea } from '@/service/modules/flightArea'

type PropsType = {
  onSuccess?: () => void
}

const DrawPolygon: FC<PropsType> = memo(({ onSuccess }) => {
  const { viewer } = useCesium()

  const [paths, setPaths] = useState<number[][]>([])
  const latestPaths = useLatest(paths)
  const [endPoint, setEndPoint] = useState<number[] | null>(null)

  const [open, { setTrue, setFalse }] = useBoolean(false)

  const drawingColor = useMapDrawStore((s) => s.drawingColor)
  const fillOpacity = useMapDrawStore((s) => s.fillOpacity)
  const lineStyle = useMapDrawStore((s) => s.lineStyle)
  const isFlightArea = useMapDrawStore((s) => s.isFlightArea)

  const createFn = useMemo(() => {
    if (isFlightArea) {
      return createFlightArea
    } else {
      return createOverlay
    }
  }, [isFlightArea])

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
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 移动
    handler.setInputAction((e) => {
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      const geo = cartesian3ToDegrees(cartesian)
      // endPoint.current = [geo[0], geo[1]]
      setEndPoint([geo[0], geo[1], round(geo[2], 2)])
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 右键结束
    handler.setInputAction(() => {
      if (latestPaths.current.length >= 2) {
        setTrue()
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [viewer])

  const handleConfirm = async (data: any) => {
    if (paths.length < 2) {
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
      overlayPositions: JSON.stringify([...paths, endPoint]),
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
          '-value': `${lineStyle}`, //描边样式(solid:实线;dashed:虚线;dotted:斑点线,outlined:轮廓线)
        },
        fillColor: {
          '-value': `${fillColorARGB}`, //填充色（argb）
        },
        fillOpacity: {
          '-value': `${fillOpacity}`,
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
      overlayExtType: data.overlayExtType,
      cotType: CotType.SHAPE_POLYGON,
    }
    await createFn(commitData)
    onSuccess?.()
    setFalse()
  }

  const positions = useMemo(() => {
    if (!endPoint || paths.length < 1) {
      return paths
    }
    return [...paths, endPoint]
  }, [paths, endPoint])

  return (
    <>
      {isFlightArea ? (
        <AddFlightAreaModal
          open={open}
          onClose={() => {
            setFalse()
            setPaths([])
            setEndPoint(null)
          }}
          onConfirm={handleConfirm}
        />
      ) : (
        <AddFormModal
          open={open}
          onClose={() => {
            setFalse()
            setPaths([])
            setEndPoint(null)
          }}
          onConfirm={handleConfirm}
        />
      )}
      {positions && viewer && (
        <OverlayPolygon
          data={''}
          viewer={viewer}
          path={positions}
          asynchronous={false}
          fill={drawingColor}
          fillOpacity={fillOpacity}
          stroke={drawingColor}
          strokeStyle={lineStyle}
          strokeWeight={2}
        />
      )}
    </>
  )
})

DrawPolygon.displayName = 'DrawPolygon'

export default DrawPolygon
