import MapInfo from './MapInfo'
import DrawArea from './DrawArea'

type PropsType = unknown
/**最大支持重建半径，单位m */
const MAX_RADIUS = 300
/**最小支持重建半径，单位m */
const MIN_RADIUS = 50

const UavReconstruction: FC<PropsType> = memo(() => {
  const [state, setState] = useState<
    | 'drawing'
    | 'setting'
    | 'error_max'
    | 'error_min'
    | 'reconstructing'
    | 'reconstruction_end'
  >('drawing')

  return (
    <>
      <MapInfo state={state} MAX_RADIUS={MAX_RADIUS} MIN_RADIUS={MIN_RADIUS} />
      <DrawArea
        setState={setState}
        MAX_RADIUS={MAX_RADIUS}
        MIN_RADIUS={MIN_RADIUS}
      />
    </>
  )
})

UavReconstruction.displayName = 'Reconstruction'

export default UavReconstruction
