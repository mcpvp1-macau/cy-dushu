import DrawingTypeSelecter from './DrawingTypeSelecter'
import ColorSelecter from './ColorSelecter'
import LineStyleSelecter from './LineStyleSelecter'
import OpacityInput from './OpacityInput'
import IconClose from '@/assets/icons/jsx/IconClose'
import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'
import IconButton from '@/components/ui/button/IconButton'

type PropsType = {
  onClose?: () => void
}

const AddGeometry: FC<PropsType> = (props) => {
  const { onClose } = props
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)
  const isFlightArea = useMapDrawStore((s) => s.isFlightArea)
  const lineStyle = useMapDrawStore((s) => s.lineStyle)
  const updateLineStyle = useMapDrawStore((s) => s.updateLineStyle)

  // 飞行区域转到普通绘制时，描边类型如果是禁飞区那就改为实线
  useEffect(() => {
    if (!isFlightArea && lineStyle === 'no-fly') {
      updateLineStyle('solid')
    }
  }, [isFlightArea])

  const onCloseFn = useMemoizedFn(() => {
    updateDrawing(DrawType.None)
    updateRightMode(RightModeEnum.HIDE)
    onClose?.()
  })

  return (
    <div className="flex p-1 gap-2 flex-wrap text-sm">
      <DrawingTypeSelecter onChange={updateDrawing} />
      <ColorSelecter />
      <LineStyleSelecter showNoFly={isFlightArea} />
      <OpacityInput />
      <div className="flex items-center justify-center mx-3 pointer-events-auto">
        <IconButton
          className="text-lg size-[16px] flex items-center justify-center"
          onClick={onCloseFn}
        >
          <IconClose />
        </IconButton>
      </div>
    </div>
  )
}

AddGeometry.displayName = 'AddGeometry'

export default AddGeometry
