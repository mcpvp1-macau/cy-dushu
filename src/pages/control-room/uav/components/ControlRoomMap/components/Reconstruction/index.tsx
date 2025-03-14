import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import MapInfo from './MapInfo'
import DrawArea from './DrawArea'
import ReconstructionSettingModal from './SettingModal'

type PropsType = unknown
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
          <MapInfo state={state} />
          <DrawArea setState={setState} />
        </>
      )}
    </>
  )
})

UavReconstruction.displayName = 'Reconstruction'

export default UavReconstruction
