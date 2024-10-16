import MapUavRealMarker from '@/components/map/device/UavRealMarker'
import HistoryTrack from '@/components/map/HistoryTrack'
import useRealTrack from '@/hooks/device/useRealTrack'
import { GetProps } from 'antd'
import mitt from 'mitt'

type PropsType = unknown

type StateType =
  | (GetProps<typeof MapUavRealMarker>['data'] & { deviceId: string })
  | null

export const updateUavInfoEmitter = mitt<{
  uavInfo: StateType
}>()

const UavDetailMarker: FC<PropsType> = memo(() => {
  const [state, setState] = useState<StateType>(null)

  useEffect(() => {
    const handler = (uavInfo: StateType) => {
      setState(uavInfo)
    }
    updateUavInfoEmitter.on('uavInfo', handler)
    return () => {
      updateUavInfoEmitter.off('uavInfo', handler)
    }
  }, [])

  const { historyTrack, realTrack, clear } = useRealTrack(
    state?.longitude ?? 0,
    state?.latitude ?? 0,
  )

  useEffect(() => {
    clear(true)
  }, [state?.deviceId])

  if (!state) {
    return null
  }

  return (
    <>
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
