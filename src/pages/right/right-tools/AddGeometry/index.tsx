import DrawingTypeSelecter from './DrawingTypeSelecter'
import ColorSelecter from './ColorSelecter'
import LineStyleSelecter from './LineStyleSelecter'
import OpacityInput from './OpacityInput'
import IconFinish from '@/assets/icons/jsx/IconFinish'
import IconClose from '@/assets/icons/jsx/IconClose'
import useMapDrawStore, { DrawType, LineStyle } from '@/store/map/useDraw.store'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'

const AddGeometry: FC<any> = () => {
  const updateRightMode = useRightMode((s) => s.updateRightMode)

  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)
  const updateDrawingColor = useMapDrawStore((s) => s.updateDrawingColor)
  const updateLineStyle = useMapDrawStore((s) => s.updateLineStyle)
  const updateFillOpacity = useMapDrawStore((s) => s.updateFillOpacity)

  const onClose = useMemoizedFn(() => {
    updateDrawing(DrawType.None)
    updateRightMode(RightModeEnum.HIDE)
  })

  return (
    <div className="flex p-1 gap-2">
      <DrawingTypeSelecter
        onChange={(type) => {
          console.log(type)
          updateDrawing(type)
        }}
      />
      <ColorSelecter
        color="#4c90f0"
        onChange={(val) => {
          updateDrawingColor(val)
        }}
      />
      <LineStyleSelecter
        lineStyle="solid"
        onChange={(val) => {
          updateLineStyle(val as LineStyle)
        }}
      />
      <OpacityInput
        fillOpacity={0.5}
        onChange={(val) => {
          updateFillOpacity(val)
        }}
      />
      <div className="flex items-center justify-center gap-2 ml-4">
        <IconFinish className="size-[22px] flex justify-center text-[14px] cursor-pointer hover:text-[#4c90f0]" />
        <div className="w-[1px] h-3 bg-[#494f56]"></div>
        <IconClose
          className="text-[22px] cursor-pointer hover:text-[#4c90f0]"
          onClick={onClose}
        />
      </div>
    </div>
  )
}

AddGeometry.displayName = 'AddGeometry'

export default AddGeometry
