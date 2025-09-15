import useMapDrawStore from '@/store/map/useDraw.store'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { attempt, flatten } from 'lodash'
import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import * as turf from '@turf/turf'
import PositionTooltip from '@/components/map/PositionTooltip'

type PropsType = {
  onSuccess?: () => void
}

const getBearing = (
  pivot: number[],
  startPoint: number[],
  endPoint: number[],
) => {
  const pp = turf.point(pivot)
  const sp = turf.point(startPoint)
  const ep = turf.point(endPoint)
  const startBearing = (turf.rhumbBearing(pp, sp) + 360) % 360
  const endBearing = (turf.rhumbBearing(pp, ep) + 360) % 360
  const diff = endBearing - startBearing
  if (diff < 0) {
    return diff + 360
  }
  return diff
}

const DrawRangingAngle: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  /** 支点 */
  const pivot = useRef<number[] | null>(null)
  const startPoint = useRef<number[] | null>(null)
  const endPoint = useRef<number[] | null>(null)
  const [endPointState, setEndPointState] = useState<number[] | null>(null)

  const { t } = useTranslation()

  const drawingColor = useMapDrawStore((s) => s.drawingColor)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const position = new Cesium.CallbackProperty(() => {
      if (!pivot.current || !startPoint.current || !endPoint.current) {
        return Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 0])
      }
      const result = Cesium.Cartesian3.fromDegreesArray(
        flatten([startPoint.current, pivot.current, endPoint.current]),
      )
      return result
    }, false)

    const e = viewer.entities.add({
      polyline: {
        positions: position,
        width: 2,
        material: Cesium.Color.fromCssColorString(drawingColor),
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(e)
      })
    }
  }, [viewer, drawingColor])

  useEffect(() => {
    if (!viewer) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    // 左键 选点
    handler.setInputAction((e) => {
      if (pivot.current && startPoint.current) {
        return
      }
      const ray = viewer.camera.getPickRay(e.position)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      if (!pivot.current) {
        pivot.current = cartesian3ToDegrees(cartesian).slice(0, 2)
      } else {
        startPoint.current = cartesian3ToDegrees(cartesian).slice(0, 2)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 移动
    handler.setInputAction((e) => {
      if (!pivot.current || !startPoint.current) {
        return
      }
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      endPoint.current = cartesian3ToDegrees(cartesian).slice(0, 2)
      setEndPointState(endPoint.current)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 右键结束
    handler.setInputAction(() => {
      startPoint.current = null
      pivot.current = null
      endPoint.current = null
      setEndPointState(null)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [viewer])

  if (!endPointState) {
    return null
  }

  return (
    <PositionTooltip
      position={[pivot.current?.[0] ?? 0, pivot.current?.[1] ?? 0]}
      offset={[0, 20]}
    >
      <div className="py-1 px-2">
        {t('common.angle')}({t('common.clockwise')}):{' '}
        {getBearing(pivot.current!, startPoint.current!, endPointState).toFixed(
          2,
        )}
        °
      </div>
    </PositionTooltip>
  )
})

DrawRangingAngle.displayName = 'DrawFan'

export default DrawRangingAngle
