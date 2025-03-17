import { useLatest } from 'ahooks'
import { attempt } from 'lodash'
import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  polygon: number[][]
  useCallback?: boolean
  fillColor?: string
  outlineColor?: string
  outlineWidth?: number
}

const Polygon: FC<PropsType> = memo(
  ({
    polygon,
    useCallback,
    fillColor = '#3b82f666',
    outlineColor = '#3b82f6',
    outlineWidth = 2,
  }) => {
    const { viewer } = useCesium()

    const latestPolygon = useLatest(polygon)
    // 回调版多边形
    useEffect(() => {
      if (!viewer || !useCallback) {
        return
      }

      const hierarchy = new Cesium.CallbackProperty(() => {
        if (latestPolygon.current.length < 1) {
          return {
            positions: Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 0]),
          }
        }
        const result = Cesium.Cartesian3.fromDegreesArray(
          latestPolygon.current.flat(),
        )
        return { positions: result }
      }, false)

      const e = viewer.entities.add({
        polygon: {
          hierarchy,
          material: Cesium.Color.fromCssColorString(fillColor),
          height: 0,
          outline: false,
        },
      })

      const positions = new Cesium.CallbackProperty(() => {
        if (latestPolygon.current.length < 1) {
          return Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 0])
        }
        return Cesium.Cartesian3.fromDegreesArray([
          ...latestPolygon.current.flat(),
          latestPolygon.current[0][0],
          latestPolygon.current[0][1],
        ])
      }, false)

      const outline = viewer.entities.add({
        polyline: {
          positions,
          material: Cesium.Color.fromCssColorString(outlineColor),
          width: outlineWidth,
        },
      })

      return () => {
        attempt(() => {
          viewer.entities.remove(e)
          viewer.entities.remove(outline)
        })
      }
    }, [viewer, fillColor, outlineColor, outlineWidth])

    return null
  },
)

Polygon.displayName = 'Polygon'

export default Polygon
