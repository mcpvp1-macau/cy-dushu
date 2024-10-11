import { Button, Slider } from 'antd'
import { type FC } from 'react'
import styles from './style.module.less'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconMinus from '@/assets/icons/jsx/IconMinus'

type PropsType = {
  value: number
  max: number
  min: number
  step?: number
  onChange?: (val: number) => void
}

const HSlider: FC<PropsType> = ({
  value,
  max = 100,
  min = 0,
  step = 0.1,
  onChange,
}) => {
  return (
    <div className={styles.hSlider}>
      <Button
        size="small"
        icon={<IconMinus />}
        onClick={() => onChange?.(value - 1 < min ? min : value - 1)}
      />
      <div className={styles.slider}>
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
