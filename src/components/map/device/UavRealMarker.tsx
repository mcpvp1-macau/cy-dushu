import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useLatest } from 'ahooks'
import UavDirectionImg from '@/assets/marker/UavDirection.png'
import GimbalDirectionImg from '@/assets/marker/gimbalDirection.png'
import { attempt } from 'lodash'
import { calcYaw } from '@/utils/cesium/rotation'

type PropsType = {
  data: Partial<{
    longitude: number
    latitude: number
    uavYaw: number
    gimbalYaw: number
    altitude?: number
  }>
  useGimbal?: boolean
}

/** 无人机实时图标 */
const MapUavRealMarker: FC<PropsType> = memo(({ data, useGimbal = true }) => {
  const lonRef = useLatest(data.longitude)
  const latRef = useLatest(data.latitude)
  const altRef = useLatest(data.altitude || 0)
  const uavYaw = useLatest(data.uavYaw)
  const gimbalYaw = useLatest(data.gimbalYaw)

  const { viewer } = useCesium()

  const positionCallback = useRef<Cesium.PositionProperty | null>(null)
  if (!positionCallback.current) {
    positionCallback.current = new Cesium.CallbackProperty(() => {
      return Cesium.Cartesian3.fromDegrees(
        lonRef.current || 0,
        latRef.current || 0,
        altRef.current || 0,
      )
    }, false) as unknown as Cesium.PositionProperty
  }

  useEffect(() => {
    if (!viewer) return

    const uav = viewer.entities.add({
      position: positionCallback.current!,
      billboard: {
        image: UavDirectionImg,
        width: 50,
        height: 50,
        scale: 0.5,
        disableDepthTestDistance: 16_000_000,
        rotation: new Cesium.CallbackProperty(
          () => calcYaw(uavYaw.current || 0, viewer),
          false,
        ),
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(uav)
      })
    }
  }, [viewer])

  useEffect(() => {
    if (!viewer || !useGimbal) {
      return
    }

    const gimbal = viewer.entities.add({
      position: positionCallback.current!,
      billboard: {
        image: GimbalDirectionImg,
        width: 100,
        height: 100,
        scale: 0.6,
        disableDepthTestDistance: 16_000_000,
        rotation: new Cesium.CallbackProperty(
          () => calcYaw(gimbalYaw.current || 0, viewer),
          false,
        ),
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(gimbal)
      })
    }
  }, [viewer, useGimbal])

  return null
})

MapUavRealMarker.displayName = 'UavMarker'

export default MapUavRealMarker
