import DrawingTypeSelecter from './DrawingTypeSelecter'
import ColorSelecter from './ColorSelecter'
import LineStyleSelecter from './LineStyleSelecter'
import OpacityInput from './OpacityInput'
import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'
import { CotType } from '@/store/map/useDraw.store'
import useSituationLayoutStore from '@/store/layout/useSituationLayout.store'
import DrawingTypeSelectorCreating from './DrawingTypeSelectorCreating'

type PropsType = {
  overlay?: API_LAYER_OVERLAY.domain.Overlay
  isCreate?: boolean
  onTypeChange?: (type: DrawType) => void
}

const getOverlayType = (overlay: API_LAYER_OVERLAY.domain.Overlay) => {
  const typeMap = {
    [CotType.POINT]: DrawType.Point,
    [CotType.SHAPE_POLYGON]: DrawType.Polygon,
    [CotType.SHAPE_CIRCLE]: DrawType.Circle,
    [CotType.SHAPE_FAN]: DrawType.Fan,
    [CotType.SHAPE_RECT]: DrawType.Rect,
  }

  return typeMap[overlay.cotType]
}

const OverlayStyleEditor: FC<PropsType> = ({
  overlay,
  isCreate,
  onTypeChange,
}) => {
  const overlayType = useMemo(() => {
    if (!overlay) return undefined
    return getOverlayType(overlay)
  }, [overlay])

  const isFlightArea = useMapDrawStore((s) => s.isFlightArea)

  const collapsedOpen = useSituationLayoutStore((s) => s.collapsedOpen)

  const isPointEdit = overlay?.cotType === CotType.POINT
  return (
    <div
      className={clsx(
        'absolute top-3 z-50',
        'flex items-center p-1 gap-2 px-2',
        'bg-ground-1/90 rounded backdrop-blur-sm text-white text-xs',
        collapsedOpen ? 'left-[362px]' : 'left-3',
      )}
    >
      {isCreate ? (
        <DrawingTypeSelectorCreating onChange={onTypeChange} />
      ) : (
        <DrawingTypeSelecter lockedType={overlayType} />
      )}
      <ColorSelecter />
      {!isPointEdit && (
        <>
          <LineStyleSelecter showNoFly={isFlightArea} />
          <OpacityInput />
        </>
      )}
    </div>
  )
}

OverlayStyleEditor.displayName = 'OverlayStyleEditor'

export default OverlayStyleEditor
