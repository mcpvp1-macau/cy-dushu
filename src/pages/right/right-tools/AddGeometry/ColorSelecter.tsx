import { ColorPicker } from 'antd'
import useMapDrawStore from '@/store/map/useDraw.store'

const presetColors = [
  '#FFFFFF',
  '#FFFF00',
  '#FFA500',
  '#FF00FD',
  '#E92323',
  '#4C90F0',
  '#06FFFF',
  '#3EC61E',
  '#000000',
]

const ColorSelecter: FC = () => {
  const drawingColor = useMapDrawStore((s) => s.drawingColor)
  const updateDrawingColor = useMapDrawStore((s) => s.updateDrawingColor)

  const onChange = useMemoizedFn((val) => {
    updateDrawingColor(val)
  })

  return (
    <div className="flex justify-center items-center gap-2">
      <ColorPicker
        defaultValue={drawingColor}
        value={drawingColor}
        size="small"
        disabledAlpha
        format="hex"
        onChange={(val) => {
          const color = val.toHexString()
          onChange(color)
        }}
      />
      <div className="w-[1px] h-3 bg-[#494f56]"></div>
      {presetColors.map((c) => {
        return (
          <div
            key={c}
            className="w-[14px] h-[14px] rounded-[2px] cursor-pointer"
            style={{
              backgroundColor: c,
              boxShadow:
                drawingColor.toUpperCase() === c ? '0 0 0 2px #0ea5e9' : '',
            }}
            onClick={() => {
              onChange(c)
            }}
          ></div>
        )
      })}
    </div>
  )
}

ColorSelecter.displayName = 'ColorSelecter'

export default memo(ColorSelecter)
