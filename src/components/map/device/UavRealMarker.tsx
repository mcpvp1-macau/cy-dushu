import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useLatest } from 'ahooks'
import UavDirectionImg from '@/assets/marker/UavDirection.png'
import GimbalDirectionImg from '@/assets/marker/gimbalDirection.png'
import { attempt } from 'lodash'
import { calcYaw } from '@/utils/cesium/rotation'

type PropsType = {
  data: {
    longitude: number
    latitude: number
    uavYaw: number
    gimbalYaw: number
    altitude?: number
  }
}

/** 无人机实时图标 */
const MapUavRealMarker: FC<PropsType> = memo(({ data }) => {
  const lonRef = useLatest(data.longitude)
  const latRef = useLatest(data.latitude)
  const altRef = useLatest(data.altitude || 0)
  const uavYaw = useLatest(data.uavYaw)
  const gimbalYaw = useLatest(data.gimbalYaw)

  const { viewer } = useCesium()
  useEffect(() => {
    if (!viewer) return
    const positonCallback = new Cesium.CallbackProperty(() => {
      return Cesium.Cartesian3.fromDegrees(
        lonRef.current,
        latRef.current,
        altRef.current || 0,
      )
    }, false) as unknown as Cesium.PositionProperty

    const uav = viewer.entities.add({
      position: positonCallback,
      billboard: {
        image: UavDirectionImg,
        width: 50,
        height: 50,
        scale: 0.5,
        disableDepthTestDistance: 16_000_000,
        rotation: new Cesium.CallbackProperty(
          () => calcYaw(uavYaw.current, viewer),
          false,
        ),
      },
    })
    const gimbal = viewer.entities.add({
      position: positonCallback,
      billboard: {
        image: GimbalDirectionImg,
        width: 100,
        height: 100,
        scale: 0.6,
        disableDepthTestDistance: 16_000_000,
        rotation: new Cesium.CallbackProperty(
          () => calcYaw(gimbalYaw.current, viewer),
          false,
        ),
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(uav)
        viewer.entities.remove(gimbal)
      })
    }
  }, [viewer])

  return null
})

MapUavRealMarker.displayName = 'UavMarker'

export default MapUavRealMarker
