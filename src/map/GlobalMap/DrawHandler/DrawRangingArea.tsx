import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt, flatten } from 'lodash'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import PositionTooltip from '@/components/map/PostionTooltip'
import { useLatest } from 'ahooks'
import * as turf from '@turf/turf'

type PropsType = unknown

const calcArea = (path: number[][]) => {
  return turf.area(turf.polygon([path]))
}

const DrawRangingArea: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  const path = useRef<number[][]>([])
  const [endPoint, setEndPoint] = useState<number[] | null>(null)
  const endPointRef = useLatest(endPoint)

  useEffect(() => {
    if (!viewer) {
      return
    }
    const entity = viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          if (path.current.length < 1 || !endPointRef.current) {
            return {
              positions: Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 0]),
            }
          }
          const result = Cesium.Cartesian3.fromDegreesArray(
            flatten([...path.current, endPointRef.current]),
          )
          return { positions: result }
        }, false),
        material: Cesium.Color.fromCssColorString('#4c90f0').withAlpha(0.5),
      },
    })

    const outlineEntity = viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          if (path.current.length < 1 || !endPointRef.current) {
            return Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 0])
          }
          return Cesium.Cartesian3.fromDegreesArray([
            ...flatten(path.current),
            ...endPointRef.current,
            ...flatten(path.current[0]),
          ])
        }, false),
        width: 2,
        material: Cesium.Color.fromCssColorString('#4c90f0'),
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(entity)
        viewer.entities.remove(outlineEntity)
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

  const areaFmt = useMemo(() => {
    if (!endPoint || path.current.length < 2) {
      return `0 m`
    }
    const area = calcArea([...path.current, endPoint, path.current[0]])
    if (area < 1_000_000) {
      return `${area.toFixed(2)} m`
    }
    return `${(area / 1_000_000).toFixed(2)} km`
  }, [endPoint])

  if (!endPoint || path.current.length < 2) {
    return null
  }

  return (
    <PositionTooltip position={[endPoint[0], endPoint[1]]} offset={[0, 20]}>
      <div>
        面积: {areaFmt}
        <sup>2</sup>
      </div>
    </PositionTooltip>
  )
})

DrawRangingArea.displayName = 'DrawRangingLine'

export default DrawRangingArea
