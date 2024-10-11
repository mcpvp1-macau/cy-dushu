import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { getSpaceDistance } from '@/utils/geo-math'
import { attempt } from 'lodash'
import { useLatest } from 'ahooks'
import PositionTooltip from '@/components/map/PostionTooltip'

type PropsType = {}

const DrawRangingCircle: FC<PropsType> = memo(() => {
  /** 圆心 */
  const [circleCenter, setCircleCenter] = useState<number[] | null>(null)
  const circleCenterRef = useLatest(circleCenter)
  const [radius, setRadius] = useState<number>(1e-5)
  const radiusRef = useLatest(radius)

  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const axis = new Cesium.CallbackProperty(
      () => radiusRef.current ?? 1e-5,
      false,
    )
    const position = new Cesium.CallbackProperty(() => {
      return Cesium.Cartesian3.fromDegrees(
        circleCenterRef.current?.[0] ?? 0,
        circleCenterRef.current?.[1] ?? 0,
      )
    }, false)

    const e = viewer.entities.add({
      position: position, // 初始圆心
      ellipse: {
        semiMajorAxis: axis, // 半径，单位为米
        semiMinorAxis: axis, // 半径，设置为相同值使其为圆
        material: Cesium.Color.fromCssColorString('#4c90f0').withAlpha(0.4), // 半透明的颜色
      },
    })

    const outlineE = viewer.entities.add({
      position: position, // 初始圆心
      ellipse: {
        semiMajorAxis: axis, // 半径，单位为米
        semiMinorAxis: axis, // 半径，设置为相同值使其为圆
        material: Cesium.Color.TRANSPARENT, // 半透明的颜色
        outline: true,
        fill: false,
        outlineColor: Cesium.Color.fromCssColorString('#4c90f0'),
        outlineWidth: 3,
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(e)
        viewer.entities.remove(outlineE)
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

  if (!circleCenter) {
    return null
  }

  return (
    <PositionTooltip position={[circleCenter[0], circleCenter[1]]}>
      面积：{areaFmt}
      <sup>2</sup>
    </PositionTooltip>
  )
})

DrawRangingCircle.displayName = 'DrawCircle'

export default DrawRangingCircle
