import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import MapInfo from './MapInfo'
import DrawArea from './DrawArea'

type PropsType = unknown
/**最大支持重建面积，单位km² */
const MAX_AREA = 1

const UavReconstruction: FC<PropsType> = memo(() => {
  const enableReconstruction = useUavControlRoomStore(
    (s) => s.enableReconstruction,
  )
  const [state, setState] = useState<
    'drawing' | 'setting' | 'error_max' | 'reconstructing'
  >('drawing')

  return (
    <>
      {enableReconstruction && (
        <>
          <MapInfo state={state} MAX_AREA={MAX_AREA} />
          <DrawArea setState={setState} MAX_AREA={MAX_AREA} />
        </>
      )}
    </>
  )
})

UavReconstruction.displayName = 'Reconstruction'

export default UavReconstruction
