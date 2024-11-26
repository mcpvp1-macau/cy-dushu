import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useLatest } from 'ahooks'
import UavDirectionImg from '@/assets/marker/UavDirection.png'
import GimbalDirectionImg from '@/assets/marker/gimbalDirection.png'
import { attempt } from 'lodash'

type PropsType = {
  data: {
    longitude: number
    latitude: number
    uavYaw: number
    gimbalYaw: number
  }
}

/** 无人机实时图标 */
const MapUavRealMarker: FC<PropsType> = memo(({ data }) => {
  const lonRef = useLatest(data.longitude)
  const latRef = useLatest(data.latitude)
  const uavYaw = useLatest(data.uavYaw)
  const gimbalYaw = useLatest(data.gimbalYaw)

  const { viewer } = useCesium()
  useEffect(() => {
    if (!viewer) return
    const positonCallback = new Cesium.CallbackProperty(() => {
      return Cesium.Cartesian3.fromDegrees(lonRef.current, latRef.current, 0)
    }, false) as unknown as Cesium.PositionProperty

    const uav = viewer.entities.add({
      position: positonCallback,
      billboard: {
        image: UavDirectionImg,
        width: 50,
        height: 50,
        scale: 0.5,
        rotation: new Cesium.CallbackProperty(
          () =>
            (-uavYaw.current * Math.PI) / 180 + (viewer?.camera?.heading ?? 0),
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
        rotation: new Cesium.CallbackProperty(
          () =>
            (-gimbalYaw.current * Math.PI) / 180 +
            (viewer?.camera?.heading ?? 0),
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
