import DrawingTypeSelecter from './DrawingTypeSelecter'
import ColorSelecter from './ColorSelecter'
import LineStyleSelecter from './LineStyleSelecter'
import OpacityInput from './OpacityInput'
import IconFinish from '@/assets/icons/jsx/IconFinish'
import IconClose from '@/assets/icons/jsx/IconClose'
import useMapDrawStore, { DrawType, LineStyle } from '@/store/map/useDraw.store'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'

type PropsType = {
  onClose?: () => void
}

const AddGeometry: FC<PropsType> = (props) => {
  const { onClose } = props
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)

  const onCloseFn = useMemoizedFn(() => {
    updateDrawing(DrawType.None)
    updateRightMode(RightModeEnum.HIDE)
    onClose?.()
  })

  return (
    <div className="flex p-1 gap-2 flex-wrap">
      <DrawingTypeSelecter
        onChange={(type) => {
          updateDrawing(type)
        }}
      />
      <ColorSelecter />
      <LineStyleSelecter />
      <OpacityInput />
      <div className="flex items-center justify-center gap-2 ml-3">
        <IconClose
          className="text-[22px] cursor-pointer hover:text-[#4c90f0]"
          onClick={onCloseFn}
        />
      </div>
    </div>
  )
}

AddGeometry.displayName = 'AddGeometry'

export default AddGeometry
