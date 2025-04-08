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
    useShallow((s) => ({
      longitude: s.state.longitude ?? 0,
      latitude: s.state.latitude ?? 0,
      altitude: s.state.altitude ?? 0,
      uavYaw: s.state.uavYaw || 0,
      gimbalYaw: s.state.gimbalYaw || 0,
      gimbalPitch: s.state.gimbalPitch || 0,
      lensType: s.state.lensType || 'wide',
      zoomFactor: s.state.zoomFactor || 1,
      cameraType: s.state.gimbalType || s.state.cameraType,
    })),
  )

  const state = useMemo(() => {
    return {
      longitude:
        wsState.longitude || realProperties.longitude || data?.longitude || 0,
      latitude:
        wsState.latitude || realProperties.latitude || data?.latitude || 0,
      altitude:
        wsState.altitude || realProperties.altitude || data?.altitude || 0,
      uavYaw: wsState.uavYaw || realProperties.uavYaw || 0,
      gimbalYaw: wsState.gimbalYaw || realProperties.gimbalYaw || 0,
      gimbalPitch: wsState.gimbalPitch || realProperties.gimbalPitch || 0,
      lensType: wsState.lensType || realProperties.lensType || 'wide',
      zoomFactor: wsState.zoomFactor || realProperties.zoomFactor || 1,
      cameraType:
        wsState.cameraType ||
        realProperties.gimbalType ||
        realProperties.cameraType ||
        'H20T',
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
