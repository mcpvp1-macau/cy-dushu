import { memo, useEffect, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  from: [number, number, number]
  to: [number, number, number]
}

const PathLine: FC<PropsType> = memo(({ from, to }) => {
  const { viewer } = useCesium()
  useEffect(() => {
    if (!viewer) return
    const entity = viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          from[0],
          from[1],
          from[2] ?? 0,
          to[0],
          to[1],
          to[2] ?? 0,
        ]),
        width: 3,
        material: new Cesium.PolylineGlowMaterialProperty({
          color: Cesium.Color.fromCssColorString('#03D68F'),
          glowPower: 0.2,
        }),
      },
    })
    return () => {
      try {
        viewer.entities.remove(entity)
      } catch (e) {}
    }
  }, [from, to])
  return null
})

export default PathLine
