import { updateUavInfoEmitter } from '@/map/GlobalMap/DeviceMarkers/UavMarkers/UavDetailMarker'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useUnmount } from 'ahooks'
import { memo, type FC } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'

type PropsType = unknown

/** 更新无人机实时坐标 */
const UavUpdateRealMarker: FC<PropsType> = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)!
  const data = useDeviceDetailStore((s) => s.deviceDetail)

  const realProperties =
    useGlobalWsStore((s) => s.deviceRealtimeProperties[deviceId]) ?? {}

  const wsState = useUavControlRoomStore(
    useShallow((s) => ({
      longitude: s.state.longitude ?? 0,
      latitude: s.state.latitude ?? 0,
      uavYaw: s.state.uavYaw || 0,
      gimbalYaw: s.state.gimbalYaw || 0,
    })),
  )

  const state = useMemo(() => {
    return {
      longitude:
        wsState.longitude || realProperties.longitude || data?.longitude || 0,
      latitude:
        wsState.latitude || realProperties.latitude || data?.latitude || 0,
      uavYaw: wsState.uavYaw || realProperties.uavYaw || 0,
      gimbalYaw: wsState.gimbalYaw || realProperties.gimbalYaw || 0,
      deviceId: data!.deviceId,
    }
  }, [data, realProperties, wsState])

  useEffect(() => {
    updateUavInfoEmitter.emit('uavInfo', state)
  }, [state])

  useUnmount(() => {
    updateUavInfoEmitter.emit('uavInfo', null)
  })

  return null
})

UavUpdateRealMarker.displayName = 'UavUpdateRealMarker'

export default UavUpdateRealMarker
