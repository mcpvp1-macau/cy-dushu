import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { getSpaceDistance } from '@/utils/geo-math'
import { attempt } from 'lodash'
import { useLatest } from 'ahooks'
import PositionTooltip from '@/components/map/PositionTooltip'
import { OverlayCirclePrimitive } from '@/utils/customPrimitive/OverlayPrimitive'

type PropsType = Record<string, never>

const DrawRangingCircle: FC<PropsType> = memo(() => {
  /** 圆心 */
  const [circleCenter, setCircleCenter] = useState<number[] | null>(null)
  /**另一个绘制点 */
  const [circlePoint, setCirclePoint] = useState<number[] | null>(null)
  const circleCenterRef = useLatest(circleCenter)
  const [radius, setRadius] = useState<number>(1e-5)
  const radiusRef = useLatest(radius)

  const { t } = useTranslation()

  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const polygonHierarchy = new Cesium.CallbackProperty(() => {
      if (!circleCenterRef.current || radiusRef.current <= 0) {
        return new Cesium.PolygonHierarchy([])
      } else {
        return new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArrayHeights(
            OverlayCirclePrimitive.getCoordinates(
              circleCenterRef.current as [number, number, number],
              radiusRef.current,
            ).flat(),
          ),
        )
      }
    }, false)

    const positions = new Cesium.CallbackProperty(() => {
      if (!circleCenterRef.current || radiusRef.current <= 0) {
        return Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 0])
      }
      return Cesium.Cartesian3.fromDegreesArrayHeights(
        OverlayCirclePrimitive.getCoordinates(
          circleCenterRef.current as [number, number, number],
          radiusRef.current,
        ).flat(),
      )
    }, false)

    const fillEntity = viewer.entities.add({
      polygon: {
        hierarchy: polygonHierarchy,
        material: Cesium.Color.fromCssColorString('#4c90f0').withAlpha(0.4), // 半透明的颜色
        perPositionHeight: false,
      },
    })

    const outlineEntity = viewer.entities.add({
      polyline: {
        positions: positions,
        width: 2,
        material: Cesium.Color.fromCssColorString('#4c90f0'),
        clampToGround: true,
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(fillEntity)
        viewer.entities.remove(outlineEntity)
      })
    }
  }, [viewer])

  useEffect(() => {
    if (!viewer) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    // 左键 选点
    handler.setInputAction((e) => {
      if (circleCenterRef.current) {
        return
      }
      const ray = viewer.camera.getPickRay(e.position)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      setCircleCenter(cartesian3ToDegrees(cartesian))
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 移动
    handler.setInputAction((e) => {
      if (!circleCenterRef.current) {
        return
      }
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      const geo = cartesian3ToDegrees(cartesian)
      setCirclePoint(geo)
      const distance = getSpaceDistance([circleCenterRef.current!, geo])
      setRadius(distance)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 右键结束
    handler.setInputAction(() => {
      setCircleCenter(null)
      setRadius(1e-5)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [viewer])

  const areaFmt = useMemo(() => {
    if (!circleCenter) {
      return `0 m`
    }
    const area = Math.PI * radius * radius
    if (area < 1_000_000) {
      return area.toFixed(0) + ' m'
    }
    return (area / 1_000_000).toFixed(1) + ' km'
  }, [circleCenter, radius])

  if (!circleCenter || !circlePoint) {
    return null
  }

  return (
    <>
      <PositionTooltip
        position={[circleCenter[0], circleCenter[1], circleCenter[2]]}
        preventEvents={true}
      >
        {t('common.area')}: {areaFmt}
        <sup>2</sup>
      </PositionTooltip>
      <PositionTooltip
        position={[circlePoint[0], circlePoint[1], circlePoint[2]]}
        preventEvents={true}
      >
        {t('common.perimeter')}: {(2 * Math.PI * radius).toFixed(2)} m
      </PositionTooltip>
    </>
  )
})

DrawRangingCircle.displayName = 'DrawCircle'

export default DrawRangingCircle
