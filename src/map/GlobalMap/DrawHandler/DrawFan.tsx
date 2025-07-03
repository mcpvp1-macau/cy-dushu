import useMapDrawStore, { CotType } from '@/store/map/useDraw.store'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { useBoolean, useLatest } from 'ahooks'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import AddFormModal from './components/AddFormModal'
import { getHexWithAlpha, hexToARGB } from '@/utils/other/utils'
import { createOverlay } from '@/service/modules/layer_overlay'
import * as turf from '@turf/turf'
import OverlayFan from '@/map/CesiumMap/components/service/Overlaies/OverlayFan'
import AddFlightAreaModal from './components/AddFlightAreaModal'
import { createFlightArea } from '@/service/modules/flightArea'

type PropsType = {
  onSuccess?: () => void
}

const getFan = (pivot: number[], startPoint: number[], endPoint: number[]) => {
  const pp = turf.point(pivot)
  const sp = turf.point(startPoint)
  const ep = turf.point(endPoint)
  const startBearing = (turf.rhumbBearing(pp, sp) + 360) % 360
  let endBearing = (turf.rhumbBearing(pp, ep) + 360) % 360
  if (endBearing < startBearing) {
    endBearing += 360
  }
  const distance = turf.distance(pp, ep)
  const res = [pivot]
  for (let current = startBearing; current < endBearing; current += 2) {
    let bearing = current
    if (bearing >= 360) {
      bearing -= 360
    }
    if (bearing > 180) {
      bearing -= 360
    }
    const newPoint = turf.destination(pp, distance, bearing)
    res.push([...newPoint.geometry.coordinates, pivot[2]])
  }
  res.push(turf.destination(pp, distance, endBearing).geometry.coordinates)
  res.push(pivot)
  return res
}

const DrawFan: FC<PropsType> = memo(({ onSuccess }) => {
  const { viewer } = useCesium()

  const [drawingPositions, setDrawingPositions] = useState<[number, number][]>(
    [],
  )
  const latestPosition = useLatest(drawingPositions)

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

      const point = cartesian3ToDegrees(cartesian).slice(0, 2) as [
        number,
        number,
      ]
      // 有了3个点就不新插入了
      setDrawingPositions((prePositions) => {
        if (prePositions.length === 3) {
          return prePositions
        }
        // 没点的时候插入两个，第二个用来移动更新
        if (prePositions.length === 0) {
          return [point, point]
        }
        const newPositions = [...prePositions, point]
        return newPositions
      })
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 移动
    handler.setInputAction((e) => {
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      const point = cartesian3ToDegrees(cartesian).slice(0, 2) as [
        number,
        number,
      ]
      // 更新最后一个点的位置
      setDrawingPositions((prePositions) => {
        if (prePositions.length <= 1) {
          return prePositions
        }
        const positions = [...prePositions]
        positions.pop()
        positions.push(point)

        return positions
      })
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 右键结束
    handler.setInputAction(() => {
      if (latestPosition.current.length === 3) {
        setTrue()
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [viewer])

  const handleConfirm = async (data: any) => {
    if (drawingPositions.length < 3) {
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
      overlayPositions: JSON.stringify(drawingPositions),
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
          '-value': `${lineStyle}`, //描边样式(solid:实线;dashed:虚线;no-fly:禁飞区样式线)
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
      cotType: CotType.SHAPE_FAN,
    }
    await createFn(commitData)
    onSuccess?.()
    setFalse()
  }

  return (
    <>
      {isFlightArea ? (
        <AddFlightAreaModal
          open={open}
          onClose={() => {
            setFalse()
            setDrawingPositions([])
          }}
          onConfirm={handleConfirm}
        />
      ) : (
        <AddFormModal
          open={open}
          onClose={() => {
            setFalse()
            setDrawingPositions([])
          }}
          onConfirm={handleConfirm}
        />
      )}

      {viewer && (
        <OverlayFan
          data={''}
          positions={drawingPositions}
          viewer={viewer}
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

DrawFan.displayName = 'DrawFan'

export default DrawFan
