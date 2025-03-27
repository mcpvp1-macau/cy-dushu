import { GimbalPick } from '@/utils/cesium/camera/camera-vertex-pick'
import { useLatest } from 'ahooks'
import { attempt } from 'lodash'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  gimbalPick: Required<Omit<GimbalPick, 'center'>>
  position: number[]
}

const CameraGroundFrustum: FC<PropsType> = memo(({ gimbalPick, position }) => {
  const { viewer } = useCesium()

  const gimbalPickRef = useLatest(gimbalPick)
  const positionRef = useLatest(position)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const mkPath = () => {
      const g = gimbalPickRef.current
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
    }

    const position = new Cesium.CallbackProperty(() => {
      return {
        positions: mkPath(),
      }
    }, false)

    const entity = viewer.entities.add({
      polygon: {
        hierarchy: position,
        material: Cesium.Color.fromCssColorString('#3dcc91').withAlpha(0.2),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })

    const outlineEntity = viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => mkPath(), false),
        material: Cesium.Color.fromCssColorString('#3dcc91'),
        width: 1,
        clampToGround: true,
      },
    })

    const frustumEntities = [
      ['leftBottom', 'rightBottom'],
      ['rightBottom', 'rightTop'],
      ['rightTop', 'leftTop'],
      ['leftTop', 'leftBottom'],
    ].map(([startPoint, endPoint]) => {
      return viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.CallbackProperty(() => {
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

            return new Cesium.PolygonHierarchy([p1, p2, p3])
          }, false),

          material: new Cesium.ImageMaterialProperty({
            image: '/images/mask/ban-area-liner2.png',
            color: Cesium.Color.fromCssColorString('#3dcc91').withAlpha(0.4),
          }),
          perPositionHeight: true,
        },
      })
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(entity)
        viewer.entities.remove(outlineEntity)
        frustumEntities.forEach((entity) => viewer.entities.remove(entity))
      })
    }
  }, [viewer])

  return null
})

export default CameraGroundFrustum
