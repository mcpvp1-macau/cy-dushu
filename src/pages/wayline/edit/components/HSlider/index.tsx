import { Button, Slider } from 'antd'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconMinus from '@/assets/icons/jsx/IconMinus'

type PropsType = {
  value: number
  max: number
  min: number
  step?: number
  onChange?: (val: number) => void
  className?: string
}

const HSlider: FC<PropsType> = ({
  value,
  max = 100,
  min = 0,
  step = 0.1,
  onChange,
  className,
}) => {
  return (
    <div className={clsx('flex justify-between items-center gap-3', className)}>
      <Button
        size="small"
        icon={<IconMinus />}
        onClick={() => onChange?.(value - 1 < min ? min : value - 1)}
      />
      <div className="flex-1">
        <Slider
          value={value}
          max={max}
          min={min}
          step={step}
          onChange={onChange}
        />
      </div>
      <Button
        size="small"
        icon={<IconPlus />}
        onClick={() => onChange?.(value + 1 > max ? max : value + 1)}
      />
    </div>
  )
}

export default HSlider
