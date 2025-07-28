import { GimbalPick } from '@/utils/cesium/camera/camera-vertex-pick'
import { useLatest } from 'ahooks'
import { attempt } from 'lodash'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  gimbalPick: Required<Omit<GimbalPick, 'center'>>
  position: number[]
  /** 是否使用底面 */
  useBottomSurface?: boolean
}

const gradientMaterial = new Cesium.Material({
  fabric: {
    type: 'VerticalGradient',
    uniforms: {
      colorTop: Cesium.Color.fromCssColorString('#3dcc91').withAlpha(0.4),
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

const dirs = [
  ['leftBottom', 'rightBottom'],
  ['rightBottom', 'rightTop'],
  ['rightTop', 'leftTop'],
  ['leftTop', 'leftBottom'],
]

const CameraGroundFrustum: FC<PropsType> = memo(
  ({ gimbalPick, position, useBottomSurface = true }) => {
    const { viewer } = useCesium()

    const gimbalPickRef = useLatest(gimbalPick)
    const positionRef = useLatest(position)

    const groundPath = useMemo(() => {
      const g = gimbalPick
      return Cesium.Cartesian3.fromDegreesArray([
        g.leftBottom[0],
        g.leftBottom[1],
        g.rightBottom[0],
        g.rightBottom[1],
        g.rightTop[0],
        g.rightTop[1],
        g.leftTop[0],
        g.leftTop[1],
        g.leftBottom[0],
        g.leftBottom[1],
      ])
    }, [gimbalPick])

    useEffect(() => {
      if (!viewer) {
        return
      }

      const outlinePrimitve = new Cesium.GroundPolylinePrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.GroundPolylineGeometry({
            positions: groundPath,
          }),
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(Cesium.Material.ColorType, {
            color: Cesium.Color.fromCssColorString('#3dcc91'),
          }),
        }),
        asynchronous: false,
      })

      viewer.scene.primitives.add(outlinePrimitve)

      const frustumPrimitive = new Cesium.Primitive({
        geometryInstances: dirs.map(([startPoint, endPoint]) => {
          const g = gimbalPickRef.current
          const p3 = Cesium.Cartesian3.fromDegrees(
            positionRef.current[0],
            positionRef.current[1],
            positionRef.current[2],
          )

          const p1 = Cesium.Cartesian3.fromDegrees(
            g[startPoint][0],
            g[startPoint][1],
            viewer.scene.globe.getHeight(
              Cesium.Cartographic.fromDegrees(
                g[startPoint][0],
                g[startPoint][1],
              ),
            ) ?? 0,
          )

          const p2 = Cesium.Cartesian3.fromDegrees(
            g[endPoint][0],
            g[endPoint][1],
            viewer.scene.globe.getHeight(
              Cesium.Cartographic.fromDegrees(g[endPoint][0], g[endPoint][1]),
            ) ?? 0,
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
          if (viewer.scene.primitives) {
            viewer.scene.primitives.remove(outlinePrimitve)
            viewer.scene.primitives.remove(frustumPrimitive)
          }
        })
      }
    }, [viewer, position, groundPath])

    useEffect(() => {
      if (!viewer || !useBottomSurface) {
        return
      }

      const primitve = new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(groundPath),
          }),
        }),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
          material: Cesium.Material.fromType('Color', {
            color: Cesium.Color.fromCssColorString('#3dcc91').withAlpha(0.2),
          }),
        }),
        asynchronous: false,
      })

      viewer.scene.primitives.add(primitve)

      return () => {
        attempt(() => {
          if (viewer.scene.primitives) {
            viewer.scene.primitives.remove(primitve)
          }
        })
      }
    }, [viewer, groundPath, useBottomSurface])

    return null
  },
)

export default CameraGroundFrustum
