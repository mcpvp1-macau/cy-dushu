import { Input } from 'antd'

type PropsType = {
  fillOpacity: number
  onChange: (fillOpacity: number) => void
}

const OpacityInput: FC<PropsType> = (props) => {
  const { fillOpacity, onChange } = props

  /**0 - 100 */
  const [opacity, setOpacity] = useState(fillOpacity * 100)

  useEffect(() => {
    setOpacity(fillOpacity * 100)
    onChange(fillOpacity)
  }, [fillOpacity])

  const onBlur = useMemoizedFn((e) => {
    const val = parseFloat(e.target.value)

    if (Number.isNaN(val)) {
      setOpacity(0)
      onChange(0)
      return
    }
    if (val > 100) {
      setOpacity(100)
      onChange(1)
      return
    }
    return onChange(val / 100)
  })

  return (
    <div className="flex items-center justify-center">
      <span>透明度：</span>
      <div className="felx items-center w-[80px]">
        <Input
          onBlur={onBlur}
          size="small"
          value={opacity}
          defaultValue={opacity}
          min={0}
          max={100}
          onChange={(e) => {
            setOpacity(parseFloat(e.target.value))
          }}
        />
      </div>
      <span className="flex items-center ml-1">%</span>
    </div>
  )
}

OpacityInput.displayName = 'OpacityInput'

export default OpacityInput
