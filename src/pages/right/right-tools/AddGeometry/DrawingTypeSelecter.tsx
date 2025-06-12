import { Select } from 'antd'
import { DrawType } from '@/store/map/useDraw.store'

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
  onChange?: (type: DrawType) => void
  lockedType?: DrawType
}

const DrawingTypeSelecter: FC<PropsType> = ({ onChange, lockedType }) => {
  const onChangeType = useMemoizedFn((val) => {
    onChange && onChange(val)
  })

  useEffect(() => {
    onChangeType(opts[0].value)
  }, [])

  const options = useMemo(() => {
    if (!lockedType) {
      return opts
    } else {
      return opts.filter((item) => item.value === lockedType)
    }
  }, [lockedType])

  return (
    <Select
      options={options}
      className="w-[100px]"
      onChange={onChangeType}
      defaultValue={options[0]}
      variant="borderless"
      size="small"
    />
  )
}
DrawingTypeSelecter.displayName = 'DrawingTypeSelecter'

export default DrawingTypeSelecter
