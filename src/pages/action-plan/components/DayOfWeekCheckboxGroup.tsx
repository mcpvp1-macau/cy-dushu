import { Button } from 'antd'

type PropsType = {
  value?: number[]
  onChange?: (value: number[]) => void
}

/** 周选择器 */
const DayOfWeekCheckboxGroup: FC<PropsType> = memo((props) => {
  const { t } = useTranslation()
  const { value = [] } = props

  const weekLabels = useMemo(() => {
    return [
      t('dayOfWeek.sunday'),
      t('dayOfWeek.monday'),
      t('dayOfWeek.tuesday'),
      t('dayOfWeek.wednesday'),
      t('dayOfWeek.thursday'),
      t('dayOfWeek.friday'),
      t('dayOfWeek.saturday'),
    ]
  }, [t])

  return (
    <div className="flex gap-1.5 text-xs flex-wrap">
      {Array.from({ length: 7 }, (_, i) => (
        <Button
          size="small"
          key={i}
          type={value.includes(i) ? 'primary' : 'default'}
          onClick={() => {
            const newValue = value.includes(i)
              ? value.filter((day) => day !== i)
              : [...value, i]
            props.onChange?.(newValue)
          }}
        >
          {weekLabels[i]}
        </Button>
      ))}
    </div>
  )
})

DayOfWeekCheckboxGroup.displayName = 'DayOfWeekCheckboxGroup'

export default DayOfWeekCheckboxGroup
