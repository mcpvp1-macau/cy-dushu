import DrawingTypeSelecter from './DrawingTypeSelecter'
import ColorSelecter from './ColorSelecter'
import LineStyleSelecter from './LineStyleSelecter'
import OpacityInput from './OpacityInput'
import useMapDrawStore, { DrawType, LineStyle } from '@/store/map/useDraw.store'
import { CotType } from '@/store/map/useDraw.store'

type PropsType = {
  overlay: API_LAYER_OVERLAY.domain.Overlay
}

const getOverlayType = (overlay: API_LAYER_OVERLAY.domain.Overlay) => {
  const typeMap = {
    [CotType.SHAPE_POLYGON]: DrawType.Polygon,
    [CotType.SHAPE_CIRCLE]: DrawType.Circle,
    [CotType.SHAPE_FAN]: DrawType.Fan,
    [CotType.SHAPE_RECT]: DrawType.Rect,
  }

  return typeMap[overlay.cotType]
}

const OverlayStyleEditor: FC<PropsType> = ({ overlay }) => {
  return (
    <div
      className={clsx(
        'absolute right-[430px] top-3 z-50',
        'flex p-1 gap-2',
        'bg-[#16202be6] rounded-[3px] backdrop-blur-sm text-white',
      )}
    >
      <DrawingTypeSelecter lockedType={getOverlayType(overlay)} />
      <ColorSelecter />
      <LineStyleSelecter />
      <OpacityInput />
    </div>
  )
}

OverlayStyleEditor.displayName = 'OverlayStyleEditor'

export default OverlayStyleEditor
