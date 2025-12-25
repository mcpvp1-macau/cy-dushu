import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useShallow } from 'zustand/react/shallow'

type PropsType = unknown

/** 更新其他设备实时坐标 */
const UpdateRealMarker: FC<PropsType> = memo(() => {
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
      deviceId: targetDeviceId,
    }),
    [realLatitude, realLongitude, targetDeviceId],
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

UpdateRealMarker.displayName = 'UpdateRealMarker'

export default UpdateRealMarker
