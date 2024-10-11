import MapUavRealMarker from '@/components/map/device/UavRealMarker'
import { GetProps } from 'antd'
import mitt from 'mitt'

type PropsType = unknown

type StateType = GetProps<typeof MapUavRealMarker>['data'] | null

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

  if (!state) {
    return null
  }

  return <MapUavRealMarker data={state} />
})

UavDetailMarker.displayName = 'UavDetailMarker'

export default UavDetailMarker
