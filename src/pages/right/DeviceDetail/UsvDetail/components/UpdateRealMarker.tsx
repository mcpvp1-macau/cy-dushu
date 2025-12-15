import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = unknown

/** 更新无人船实时坐标 */
const UsvUpdateRealMarker: FC<PropsType> = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId) ?? ''
  const data = useDeviceDetailStore((s) => s.deviceDetail)

  const realProperties = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[deviceId]?.properties ?? {},
  )

  const state = useMemo(() => {
    return {
      longitude: realProperties.longitude ?? data?.longitude,
      latitude: realProperties.latitude ?? data?.latitude,
      altitude: realProperties.altitude ?? data?.altitude,
      height:
        realProperties.height ??
        realProperties.altitude ??
        data?.properties?.height ??
        data?.altitude,
      deviceId: data?.deviceId ?? deviceId,
    }
  }, [data, deviceId, realProperties])

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

UsvUpdateRealMarker.displayName = 'UsvUpdateRealMarker'

export default UsvUpdateRealMarker
