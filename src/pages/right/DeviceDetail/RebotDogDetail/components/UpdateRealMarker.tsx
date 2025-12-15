import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useShallow } from 'zustand/react/shallow'

type PropsType = unknown

/** 更新机器狗实时坐标 */
const RebotDogUpdateRealMarker: FC<PropsType> = memo(() => {
  const {
    deviceId: deviceDetailId,
    detailDeviceId,
    longitude,
    latitude,
  } = useDeviceDetailStore(
    useShallow((s) => ({
      deviceId: s.deviceId ?? '',
      detailDeviceId: s.deviceDetail?.deviceId ?? '',
      longitude: s.deviceDetail?.longitude,
      latitude: s.deviceDetail?.latitude,
    })),
  )

  const { longitude: realLongitude, latitude: realLatitude } = useGlobalWsStore(
    useShallow((s) => {
      const properties =
        s.deviceRealtimeProperties[detailDeviceId || deviceDetailId]?.properties

      return {
        longitude: properties?.longitude,
        latitude: properties?.latitude,
      }
    }),
  )

  const wsState = useRebotDogControlRoomStore(
    useShallow((s) => ({
      longitude: s.state.longitude,
      latitude: s.state.latitude,
      altitude: s.state.altitude,
      height: s.state.height,
    })),
  )

  const { setCommonState, removeCommonState } = useMapDevicesStore(
    useShallow((s) => ({
      setCommonState: s.setCommonState,
      removeCommonState: s.removeCommonState,
    })),
  )

  const targetDeviceId = detailDeviceId || deviceDetailId

  const state = useMemo(
    () => ({
      longitude: wsState.longitude ?? realLongitude ?? longitude,
      latitude: wsState.latitude ?? realLatitude ?? latitude,
      deviceId: targetDeviceId,
    }),
    [
      realLatitude,
      realLongitude,
      targetDeviceId,
      wsState.latitude,
      wsState.longitude,
    ],
  )

  useEffect(() => {
    if (!state.deviceId) return

    setCommonState(state.deviceId, state)

    return () => {
      removeCommonState(state.deviceId)
    }
  }, [removeCommonState, setCommonState, state])

  return null
})

RebotDogUpdateRealMarker.displayName = 'RebotDogUpdateRealMarker'

export default RebotDogUpdateRealMarker
