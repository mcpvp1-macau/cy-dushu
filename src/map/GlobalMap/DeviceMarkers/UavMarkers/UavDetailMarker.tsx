import MapUavRealMarker from '@/components/map/device/UavRealMarker'
import HistoryTrack from '@/components/map/HistoryTrack'
import { emtpyObject } from '@/constant/data'
import useRealTrack3D from '@/hooks/device/useRealTrack3D'
import HeightDashLine from '@/map/CesiumMap/components/service/common/HeightDashLine'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = {
  deviceId: string
}

const UavDetailMarker: FC<PropsType> = memo(({ deviceId }) => {
  const state = useMapDevicesStore((s) => s.uavStates[deviceId] ?? emtpyObject)

  const { historyTrack, realTrack, clear } = useRealTrack3D(
    state.longitude ?? 0,
    state.latitude ?? 0,
    state.altitude ?? 0,
  )

  useEffect(() => {
    clear(true)
  }, [deviceId])

  if (!state) {
    return null
  }

  return (
    <>
      <HeightDashLine
        position={[state.longitude, state.latitude, state.altitude ?? 0]}
        color="#fff"
      />
      <MapUavRealMarker data={state} />
      {historyTrack.map((track, index) => (
        <HistoryTrack key={index} value={track} />
      ))}
      {realTrack.length > 1 && <HistoryTrack value={realTrack} useCallback />}
    </>
  )
})

UavDetailMarker.displayName = 'UavDetailMarker'

export default UavDetailMarker
