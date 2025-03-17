import MapRealMarker from '@/components/map/device/WangLouModel'
import WangLouModel from '@/components/map/device/WangLouModel'
import { GetProps } from 'antd'
import mitt from 'mitt'
import Frustum from '../../Wayline/ActionAirline3D/UavPoint/Frustum'
import Radar from './Radar'

type PropsType = unknown

type StateType =
  | (GetProps<typeof MapRealMarker>['data'] & {
      deviceId: string
      pitch: number
      yaw: number
      /** 红外 */
      INFRARED_CAMERA: any
      /** 可见光 */
      VISIBLE_LIGHT_CAMERA: any
      /** 振动仪 */
      VIBRATOR: any
      /** 雷达 */
      RADAR: any
    })
  | null

export const updateWanglouInfoEmitter = mitt<{
  wanglouInfo: StateType
}>()

const WangLouDetailMarker: FC<PropsType> = memo(() => {
  const [state, setState] = useState<StateType>(null)

  useEffect(() => {
    const handler = (uavInfo: StateType) => {
      setState(uavInfo)
    }
    updateWanglouInfoEmitter.on('wanglouInfo', handler)
    return () => {
      updateWanglouInfoEmitter.off('wanglouInfo', handler)
    }
  }, [])
  if (!state) {
    return null
  }

  const data = {
    longitude: state?.longitude,
    latitude: state?.latitude,
    altitude: state.altitude || 0,
  }

  return (
    <>
      <WangLouModel data={data} />
      {/** 可见光 */}
      {state.VISIBLE_LIGHT_CAMERA ? (
        <Frustum
          position={[
            data.longitude,
            data.latitude,
            data.altitude + (state.VISIBLE_LIGHT_CAMERA.groundLift || 0),
          ]}
          rotation={{
            x: +(state.pitch ?? 0),
            y: state.yaw ?? 0,
            z: 0,
          }}
          aspectRatio={state.VISIBLE_LIGHT_CAMERA.aspectRatio}
          color="#35C2A0"
          fov={state.VISIBLE_LIGHT_CAMERA.fov}
          far={1000}
        />
      ) : null}
      {/** 红外 */}
      {state.INFRARED_CAMERA ? (
        <Frustum
          position={[
            data.longitude,
            data.latitude,
            data.altitude + (state.INFRARED_CAMERA.groundLift || 0),
          ]}
          rotation={{
            x: +(state.pitch ?? 0),
            y: state.yaw ?? 0,
            z: 0,
          }}
          aspectRatio={state.INFRARED_CAMERA.aspectRatio}
          color="#f97316"
          fov={state.INFRARED_CAMERA.fov}
          far={600}
        />
      ) : null}
      {state.RADAR?.scanRangeProfile ? (
        <>
          <Radar scanRangeProfile={state.RADAR?.scanRangeProfile} />
        </>
      ) : null}
    </>
  )
})

WangLouDetailMarker.displayName = 'WangLouDetailMarker'

export default WangLouDetailMarker
