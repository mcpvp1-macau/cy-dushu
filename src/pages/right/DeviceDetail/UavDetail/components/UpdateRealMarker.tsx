import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useShallow } from 'zustand/react/shallow'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { emtpyObject } from '@/constant/data'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = unknown

/** 更新无人机实时坐标 */
const UavUpdateRealMarker: FC<PropsType> = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)!
  const data = useDeviceDetailStore((s) => s.deviceDetail)

  const realProperties = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[deviceId]?.properties ?? emtpyObject,
  )

  const wsState = useUavControlRoomStore(
    useShallow((s) => {
      return {
        longitude: s.state.longitude,
        latitude: s.state.latitude,
        altitude: s.state.altitude,
        height: s.state.height,
        uavYaw: s.state.uavYaw,
        gimbalYaw: s.state.gimbalYaw,
        gimbalPitch: s.state.gimbalPitch,
        lensType: s.state.lensType || 'wide',
        zoomFactor: s.state.zoomFactor || 1,
        cameraType: s.state.gimbalType || s.state.cameraType,
      }
    }),
  )

  const state = useMemo(() => {
    return {
      longitude:
        wsState.longitude || realProperties.longitude || data?.longitude,
      latitude: wsState.latitude || realProperties.latitude || data?.latitude,
      altitude: wsState.altitude || realProperties.altitude || data?.altitude,
      height:
        wsState.height || realProperties.height || data?.properties.height,
      uavYaw: wsState.uavYaw || realProperties.uavYaw,
      gimbalYaw: wsState.gimbalYaw || realProperties.gimbalYaw,
      gimbalPitch: wsState.gimbalPitch,
      lensType: wsState.lensType,
      zoomFactor: wsState.zoomFactor,
      cameraType: wsState.cameraType || 'H20T',
      deviceId: data!.deviceId,
    }
  }, [data, realProperties, wsState])

  useEffect(() => {
    useMapDevicesStore.getState().updateUavStates({
      ...useMapDevicesStore.getState().uavStates,
      [state.deviceId]: state,
    })
  }, [state])

  useEffect(() => {
    return () => {
      const states = { ...useMapDevicesStore.getState().uavStates }
      delete states[state.deviceId]
      useMapDevicesStore.getState().updateUavStates(states)
    }
  }, [deviceId])

  return null
})

UavUpdateRealMarker.displayName = 'UavUpdateRealMarker'

export default UavUpdateRealMarker
