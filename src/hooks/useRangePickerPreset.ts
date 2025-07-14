import { GetProp, DatePicker } from 'antd'

const useRangePickerPreset = () => {
  const { t } = useTranslation()

  return useMemo<GetProp<typeof DatePicker.RangePicker, 'presets'>>(
    () => [
      {
        label: t('timeRange.today'),
        value: [dayjs().startOf('day'), dayjs().endOf('day')],
      },
      {
        label: t('timeRange.last1Day'),
        value: [dayjs().subtract(1, 'd'), dayjs()],
      },
      {
        label: t('timeRange.last7Days'),
        value: [dayjs().subtract(7, 'd'), dayjs()],
      },
      {
        label: t('timeRange.last30Days'),
        value: [dayjs().subtract(30, 'd'), dayjs()],
      },
      {
        label: t('timeRange.last90Days'),
        value: [dayjs().subtract(90, 'd'), dayjs()],
      },
      {
        label: t('timeRange.last365Days'),
        value: [dayjs().subtract(1, 'year'), dayjs()],
      },
      {
        label: t('timeRange.last100Years'),
        value: [dayjs().subtract(100, 'year'), dayjs()],
      },
    ],
    [t],
  )
}

export default useRangePickerPreset
