import { Input } from 'antd'
import useMapDrawStore from '@/store/map/useDraw.store'

const OpacityInput: FC = (props) => {
  // 0 - 1
  const fillOpacity = useMapDrawStore((s) => s.fillOpacity)
  const updateFillOpacity = useMapDrawStore((s) => s.updateFillOpacity)

  /**0 - 100 */
  const [opacity, setOpacity] = useState(fillOpacity * 100)

  useEffect(() => {
    let newFillOpacity = opacity / 100
    if (Number.isNaN(opacity)) {
      newFillOpacity = 0
      return
    }
    if (opacity > 100) {
      newFillOpacity = 1
      return
    }

    updateFillOpacity(newFillOpacity)
  }, [opacity])

  return (
    <div className="flex items-center justify-center">
      <span>透明度：</span>
      <div className="felx items-center w-[80px]">
        <Input
          size="small"
          value={opacity}
          defaultValue={opacity}
          min={0}
          max={100}
          onChange={(e) => {
            setOpacity(parseFloat(e.target.value) || 0)
          }}
        />
      </div>
      <span className="flex items-center ml-1">%</span>
    </div>
  )
}

OpacityInput.displayName = 'OpacityInput'

export default OpacityInput
