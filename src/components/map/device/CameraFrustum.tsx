import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { useCesium } from 'resium'

type PropsType = {
  corners: number[][]
  position: number[]
}

const gradientMaterial = new Cesium.Material({
  fabric: {
    type: 'VerticalGradient',
    uniforms: {
      colorTop: Cesium.Color.fromCssColorString('#3dcc91').withAlpha(0.3),
      colorBottom: Cesium.Color.fromCssColorString('#3dcc91').withAlpha(0.02),
    },
    source: `
      uniform vec4 colorTop;
      uniform vec4 colorBottom;
      
      czm_material czm_getMaterial(czm_materialInput materialInput)
      {
        vec4 outColor = colorTop;
        czm_material material = czm_getDefaultMaterial(materialInput);
      
        vec2 st = materialInput.st;
        outColor = mix(colorBottom, colorTop, st.t);
      
        material.diffuse = outColor.rgb;
        material.alpha = outColor.a;
        return material;
      }
    `,
  },
})

const CameraFrustum: FC<PropsType> = memo(({ corners, position }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer || corners.length !== 4) {
      return
    }

    const frustumPrimitive = new Cesium.Primitive({
      geometryInstances: Array.from({ length: 4 }).map((_, i) => {
        const startPoint = corners[i]
        const endPoint = corners[(i + 1) % 4]
        const p3 = Cesium.Cartesian3.fromDegrees(
          position[0],
          position[1],
          position[2],
        )

        const p1 = Cesium.Cartesian3.fromDegrees(
          startPoint[0],
          startPoint[1],
          startPoint[2],
        )

        const p2 = Cesium.Cartesian3.fromDegrees(
          endPoint[0],
          endPoint[1],
          endPoint[2],
        )

        return new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy([p3, p2, p1, p3]),
            perPositionHeight: true,
            textureCoordinates: new Cesium.PolygonHierarchy(
              [
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 1],
              ].map((item) => Cesium.Cartesian3.fromArray(item)),
            ),
          }),
        })
      }),
      appearance: new Cesium.MaterialAppearance({
        material: gradientMaterial,
        translucent: true,
        flat: true,
      }),
      asynchronous: false,
    })

    viewer.scene.primitives.add(frustumPrimitive)

    return () => {
      attempt(() => {
        viewer.scene.primitives.remove(frustumPrimitive)
      })
    }
  }, [viewer, position, corners])

  return null
})

CameraFrustum.displayName = 'CameraFrustum'

export default CameraFrustum
