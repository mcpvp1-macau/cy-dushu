import { Select } from 'antd'
import { DrawType } from '@/store/map/useDraw.store'
import { useTranslation } from 'react-i18next'

type PropsType = {
  onChange?: (type: DrawType) => void
  lockedType?: DrawType
}

const DrawingTypeSelecter: FC<PropsType> = ({ onChange, lockedType }) => {
  const onChangeType = useMemoizedFn((val) => {
    onChange && onChange(val)
  })

  const { t } = useTranslation()

  const opts = [
    {
      label: t('overlay.drawing.circle.title'),
      value: DrawType.Circle,
    },
    {
      label: t('overlay.drawing.rect.title'),
      value: DrawType.Rect,
    },
    {
      label: t('overlay.drawing.polygon.title'),
      value: DrawType.Polygon,
    },
    {
      label: t('overlay.drawing.sector.title'),
      value: DrawType.Fan,
    },
  ]

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
