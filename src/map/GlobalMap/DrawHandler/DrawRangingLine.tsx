import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt, flatten } from 'lodash'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import PositionTooltip from '@/components/map/PostionTooltip'
import { useLatest } from 'ahooks'
import { getSpaceDistance } from '@/utils/geo-math'

type PropsType = unknown

const DrawRangingLine: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  const path = useRef<number[][]>([])
  const [endPoint, setEndPoint] = useState<number[] | null>(null)
  const endPointRef = useLatest(endPoint)

  useEffect(() => {
    if (!viewer) {
      return
    }
    const entity = viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          if (path.current.length < 1 || !endPointRef.current) {
            return Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 0])
          }
          console.log(path.current)
          return Cesium.Cartesian3.fromDegreesArray([
            ...flatten(path.current),
            ...endPointRef.current,
          ])
        }, false),
        width: 2,
        material: Cesium.Color.fromCssColorString('#4c90f0'),
      },
    })
    return () => {
      attempt(() => {
        viewer.entities.remove(entity)
      })
    }
  }, [viewer])

  useEffect(() => {
    if (!viewer) {
      return
    }
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction((e) => {
      const ray = viewer.camera.getPickRay(e.position)
      if (!ray) {
        return
      }
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) {
        return
      }
      path.current.push(cartesian3ToDegrees(cartesian).slice(0, 2))
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    handler.setInputAction((e) => {
      if (!path.current.length) {
        return
      }
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) {
        return
      }
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) {
        return
      }
      setEndPoint(cartesian3ToDegrees(cartesian).slice(0, 2))
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(() => {
      path.current = []
      setEndPoint(null)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [viewer])

  const distanceFmt = useMemo(() => {
    if (!endPoint) {
      return `0 m`
    }
    const distance = getSpaceDistance([...path.current, endPoint])
    if (distance < 1000) {
      return distance.toFixed(0) + ' m'
    }
    return (distance / 1000).toFixed(1) + ' km'
  }, [endPoint])

  if (!endPoint) {
    return null
  }

  return (
    <PositionTooltip position={[endPoint[0], endPoint[1]]} offset={[0, 20]}>
      <div>距离: {distanceFmt}</div>
    </PositionTooltip>
  )
})

DrawRangingLine.displayName = 'DrawRangingLine'

export default DrawRangingLine
