import useRangePickerPreset from '@/hooks/useRangePickerPreset'
import { DatePicker, GetProps } from 'antd'

type PropsType = GetProps<typeof DatePicker.RangePicker>

const DateRangePicker: FC<PropsType> = memo((props) => {
  const presets = useRangePickerPreset()

  return <DatePicker.RangePicker presets={presets} {...props} />
})

DateRangePicker.displayName = 'DateRangePicker'

export default DateRangePicker
