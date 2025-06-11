import { Select } from 'antd'
import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'

const opts = [
  {
    label: '圆形',
    value: DrawType.Circle,
  },
  {
    label: '方形',
    value: DrawType.Rect,
  },
  {
    label: '多边形',
    value: DrawType.Polygon,
  },
  {
    label: '扇形',
    value: DrawType.Fan,
  },
]

type PropsType = {
  onChange: (type: DrawType) => void
}

const DrawingTypeSelecter: FC<PropsType> = ({ onChange }) => {
  const onChangeType = useMemoizedFn((val) => {
    onChange(val)
  })

  useEffect(() => {
    onChangeType(opts[0].value)
  }, [])

  return (
    <Select
      options={opts}
      className="w-[100px]"
      onChange={onChangeType}
      defaultValue={opts[0]}
      variant="borderless"
      size="small"
    />
  )
}
DrawingTypeSelecter.displayName = 'DrawingTypeSelecter'

export default DrawingTypeSelecter
