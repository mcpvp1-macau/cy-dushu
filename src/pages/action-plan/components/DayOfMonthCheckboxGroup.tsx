import { Button } from 'antd'

type PropsType = {
  value?: number[]
  onChange?: (value: number[]) => void
}

/** 月选择器 */
const DayOfMonthCheckboxGroup: FC<PropsType> = memo((props) => {
  const { value = [] } = props

  return (
    <div className="flex gap-1.5 text-xs flex-wrap">
      {Array.from({ length: 31 }, (_, i) => {
        const idx = i + 1 // Days of the month are 1-indexed
        return (
          <Button
            size="small"
            key={i}
            type={value.includes(idx) ? 'primary' : 'default'}
            onClick={() => {
              const newValue = value.includes(idx)
                ? value.filter((day) => day !== idx)
                : [...value, idx]
              props.onChange?.(newValue)
            }}
          >
            <div className="w-4 text-center">{i + 1}</div>
          </Button>
        )
      })}
    </div>
  )
})

DayOfMonthCheckboxGroup.displayName = 'DayOfMonthCheckboxGroup'

export default DayOfMonthCheckboxGroup
