import { useEffect, type FC } from 'react'
import { memo } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { AirpointsConfigItem } from '@/store/wayline/uav-airline/types'
import { computeRayTerrainIntersection } from '@/utils/cesium/computeRayTerrainIntersection'
import { attempt } from 'lodash'
// import { getColorWithAlpha } from '@/utils/utils';

type PropsType = {
  point1: AirpointsConfigItem
  point2: AirpointsConfigItem
}

const PathLine: FC<PropsType> = ({ point1, point2 }) => {
  const { viewer } = useCesium()

  const addEntityLine = useMemoizedFn(
    (
      p1: Cesium.Cartographic,
      p2: Cesium.Cartographic,
      viewer: Cesium.Viewer,
    ) => {
      const positions = new Cesium.CallbackProperty((_, result) => {
        const positions = [
          Cesium.Cartesian3.fromRadians(p1.longitude, p1.latitude, p1.height),
          Cesium.Cartesian3.fromRadians(p2.longitude, p2.latitude, p2.height),
        ]
        if (Cesium.defined(result)) {
          result.length = 0 // 清空现有数组
          result.push(...positions)
        }
        return positions
      }, false)

      const entity = viewer.entities.add({
        polyline: {
          positions,
          width: 4,
          material: Cesium.Color.fromCssColorString('#03D68F'),
        },
      })
      return entity
    },
  )

  useEffect(() => {
    if (!viewer?.scene) return

    const { pointX: lng1, pointY: lat1, pointZ: alt1 } = point1
    const { pointX: lng2, pointY: lat2, pointZ: alt2 } = point2

    const p1 = Cesium.Cartographic.fromDegrees(lng1, lat1, alt1)
    const p2 = Cesium.Cartographic.fromDegrees(lng2, lat2, alt2)

    const intersection1 = computeRayTerrainIntersection(p1, p2, viewer)
    const intersection2 = computeRayTerrainIntersection(p2, p1, viewer)

    const entities: Cesium.Entity[] = []
    const primitives: Cesium.Primitive[] = []

    if (intersection1 && intersection2) {
      const lines = [
        [p1, intersection1],
        [intersection1, intersection2],
        [intersection2, p2],
      ]
      entities.push(addEntityLine(p1, intersection1, viewer))
      entities.push(addEntityLine(intersection2, p2, viewer))

      const primitive = new Cesium.Primitive({
        geometryInstances: lines.slice(1, 2).map((line) => {
          return new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
              positions: line.map((p) =>
                Cesium.Cartesian3.fromRadians(
                  p.longitude,
                  p.latitude,
                  p.height,
                ),
              ),
              width: 4,
            }),
          })
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType('PolylineDash', {
            color: Cesium.Color.fromCssColorString('#f92633'),
            dashLength: 12,
          }),
          renderState: {
            depthTest: {
              enabled: false,
            },
          },
        }),
      })
      primitives.push(viewer.scene.primitives.add(primitive))
    } else {
      entities.push(addEntityLine(p1, p2, viewer))
    }

    return () => {
      attempt(() => {
        entities.forEach((entity) => {
          viewer.entities.remove(entity)
        })
        primitives.forEach((primitive) => {
          viewer.scene.primitives.remove(primitive)
        })
      })
    }
  }, [point1, point2])
  return null
}

export default memo(PathLine)
