import { useUnmount } from 'ahooks'
import { memo, type FC } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { updateWanglouInfoEmitter } from '@/map/GlobalMap/DeviceMarkers/WangLouMarkers/WangLouDetailMarker'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'

type PropsType = unknown

/** 更新无人机实时坐标 */
const WanglouUpdateRealMarker: FC<PropsType> = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)!
  const data = useDeviceDetailStore((s) => s.deviceDetail)

  const realProperties =
    useGlobalWsStore((s) => s.deviceRealtimeProperties[deviceId]) ?? {}

  // 红外
  const INFRARED_CAMERA = data?.childDevice?.find(
    (item) => item.deviceType === 'INFRARED_CAMERA',
  )
  // 可见光
  const VISIBLE_LIGHT_CAMERA = data?.childDevice?.find(
    (item) => item.deviceType === 'VISIBLE_LIGHT_CAMERA',
  )
  // 振动仪
  const VIBRATOR = data?.childDevice?.find(
    (item) => item.deviceType === 'VIBRATOR',
  )

  // 
  const RADAR = data?.childDevice?.find(
    (item) => item.deviceType === 'RADAR',
  )

  const wsState = useWangLouControlRoomStore(
    useShallow((s) => ({
      longitude: s.state.longitude ?? 0,
      latitude: s.state.latitude ?? 0,
      altitude: s.state.altitude ?? 0,
      pitch: s.state.pitch ?? 0,
      yaw: s.state.yaw ?? 0,
      [INFRARED_CAMERA?.deviceId || '']: s.state[INFRARED_CAMERA?.deviceId || ''],
      [VISIBLE_LIGHT_CAMERA?.deviceId || '']: s.state[VISIBLE_LIGHT_CAMERA?.deviceId || ''],
      [VIBRATOR?.deviceId || '']: s.state[VIBRATOR?.deviceId || ''],
      [RADAR?.deviceId || '']: s.state[RADAR?.deviceId || '']
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
      pitch: (wsState.pitch || realProperties.pitch || data?.pitch) / 100,
      yaw: (wsState.yaw || realProperties.yaw || data?.yaw) / 100,
      INFRARED_CAMERA: wsState[INFRARED_CAMERA?.deviceId || ''] || INFRARED_CAMERA?.properties,
      VISIBLE_LIGHT_CAMERA: wsState[VISIBLE_LIGHT_CAMERA?.deviceId || ''] || VISIBLE_LIGHT_CAMERA?.properties,
      VIBRATOR: wsState[VIBRATOR?.deviceId || ''] || VIBRATOR?.properties,
      RADAR: wsState[RADAR?.deviceId || ''] || RADAR?.properties,
      deviceId: data?.deviceId || '',
    }
  }, [data, realProperties, wsState])

  useEffect(() => {
    updateWanglouInfoEmitter.emit('wanglouInfo', state)
  }, [state])

  useUnmount(() => {
    updateWanglouInfoEmitter.emit('wanglouInfo', null)
  })

  return null
})

WanglouUpdateRealMarker.displayName = 'WanglouUpdateRealMarker'

export default WanglouUpdateRealMarker
