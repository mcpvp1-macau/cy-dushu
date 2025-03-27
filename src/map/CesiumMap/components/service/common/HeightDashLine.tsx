import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { useCesium } from 'resium'

type PropsType = {
  position: number[]
  color?: string
}

const HeightDashLine: FC<PropsType> = memo(
  ({ position, color = '#c7d1dc' }) => {
    const { viewer } = useCesium()

    useEffect(() => {
      if (!viewer) {
        return
      }
      // 地形点
      const bottomPosition = Cesium.Cartesian3.fromDegrees(
        position[0],
        position[1],
        0,
      )
      const bottomEntity = viewer.entities.add({
        position: bottomPosition,
        billboard: {
          image: '/images/airline/ground-point.svg',
          scale: 0.8,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      })

      const p = position
      const cartographic = Cesium.Cartographic.fromDegrees(p[0], p[1])

      // 航点与地形点之间的虚线
      const lineEntity = viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            p[0],
            p[1],
            viewer.scene.globe.getHeight(cartographic) ?? 0,
            p[0],
            p[1],
            p[2],
          ]),
          width: 1,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString(color),
            dashLength: 4,
          }),
        },
      })

      return () => {
        attempt(() => {
          viewer.entities.remove(bottomEntity)
          viewer.entities.remove(lineEntity)
        })
      }
    }, [viewer, color, position])

    return null
  },
)

HeightDashLine.displayName = 'HeightDashLine'

export default HeightDashLine
