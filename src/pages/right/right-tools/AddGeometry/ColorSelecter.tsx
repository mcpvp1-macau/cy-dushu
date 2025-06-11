import { ColorPicker } from 'antd'

type Props = {
  color: string
  onChange: (color: string) => void
}

const presetColors = [
  '#ffffff',
  '#FFFF00',
  '#FFA500',
  '#FF00FD',
  '#E92323',
  '#4C90F0',
  '#06FFFF',
  '#3EC61E',
  '#000000',
]

const ColorSelecter: FC<Props> = (props) => {
  const { color, onChange } = props

  const [selectedColor, setSelectedColor] = useState(color)

  useEffect(() => {
    setSelectedColor(color)
    onChange(color)
  }, [color])

  return (
    <div className="flex justify-center items-center gap-2">
      <ColorPicker
        defaultValue={color}
        value={selectedColor}
        size="small"
        disabledAlpha
        format="hex"
        onChange={(val) => {
          const color = val.toHexString().toUpperCase()
          setSelectedColor(color)
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
              boxShadow: selectedColor === c ? '0 0 0 2px #4c90f0' : '',
            }}
            onClick={() => {
              setSelectedColor(c)
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
