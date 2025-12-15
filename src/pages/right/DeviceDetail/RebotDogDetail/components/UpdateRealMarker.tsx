import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useShallow } from 'zustand/react/shallow'

type PropsType = unknown

/** 更新机器狗实时坐标 */
const RebotDogUpdateRealMarker: FC<PropsType> = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId) ?? ''
  const data = useDeviceDetailStore((s) => s.deviceDetail)

  const realProperties = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[deviceId]?.properties ?? {},
  )

  const wsState = useRebotDogControlRoomStore(
    useShallow((s) => ({
      longitude: s.state.longitude,
      latitude: s.state.latitude,
      altitude: s.state.altitude,
      height: s.state.height,
    })),
  )

  const state = useMemo(() => {
    return {
      longitude: wsState.longitude ?? realProperties.longitude ?? data?.longitude,
      latitude: wsState.latitude ?? realProperties.latitude ?? data?.latitude,
      altitude: wsState.altitude ?? realProperties.altitude ?? data?.altitude,
      height:
        wsState.height ?? realProperties.height ?? data?.properties?.height ?? 0,
      deviceId: data?.deviceId ?? deviceId,
    }
  }, [data, deviceId, realProperties, wsState])

  useEffect(() => {
    if (!state.deviceId) return
    const next = { ...useMapDevicesStore.getState().commonStates }
    next[state.deviceId] = state
    useMapDevicesStore.getState().updateCommonStates(next)
  }, [state])

  useEffect(() => {
    return () => {
      if (!state.deviceId) return
      const next = { ...useMapDevicesStore.getState().commonStates }
      delete next[state.deviceId]
      useMapDevicesStore.getState().updateCommonStates(next)
    }
  }, [state.deviceId])

  return null
})

RebotDogUpdateRealMarker.displayName = 'RebotDogUpdateRealMarker'

export default RebotDogUpdateRealMarker
