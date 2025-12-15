import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useShallow } from 'zustand/react/shallow'

type PropsType = unknown

/** 更新无人船实时坐标 */
const UsvUpdateRealMarker: FC<PropsType> = memo(() => {
  const {
    deviceId: deviceDetailId,
    detailDeviceId,
    longitude,
    latitude,
    altitude,
    height,
  } = useDeviceDetailStore(
    useShallow((s) => ({
      deviceId: s.deviceId ?? '',
      detailDeviceId: s.deviceDetail?.deviceId ?? '',
      longitude: s.deviceDetail?.longitude,
      latitude: s.deviceDetail?.latitude,
      altitude: s.deviceDetail?.altitude,
      height: s.deviceDetail?.properties?.height,
    })),
  )

  const {
    longitude: realLongitude,
    latitude: realLatitude,
    altitude: realAltitude,
    height: realHeight,
  } = useGlobalWsStore(
    useShallow((s) => {
      const properties =
        s.deviceRealtimeProperties[detailDeviceId || deviceDetailId]?.properties

      return {
        longitude: properties?.longitude,
        latitude: properties?.latitude,
        altitude: properties?.altitude,
        height: properties?.height,
      }
    }),
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
      longitude: realLongitude ?? longitude,
      latitude: realLatitude ?? latitude,
      altitude: realAltitude ?? altitude,
      height: realHeight ?? height ?? 0,
      deviceId: targetDeviceId,
    }),
    [
      altitude,
      height,
      latitude,
      longitude,
      realAltitude,
      realHeight,
      realLatitude,
      realLongitude,
      targetDeviceId,
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

UsvUpdateRealMarker.displayName = 'UsvUpdateRealMarker'

export default UsvUpdateRealMarker
