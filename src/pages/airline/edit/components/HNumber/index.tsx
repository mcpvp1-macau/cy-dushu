import { memo, useState, type FC } from 'react'
import styles from './style.module.less'
import { Button, InputNumber } from 'antd'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconMinus from '@/assets/icons/jsx/IconMinus'

type PropsType = {
  value: number
  unit?: string
  min?: number
  max?: number
  negatives?: number[]
  positives?: number[]
  onChange?: (value: number) => void
}

const HNumber: FC<PropsType> = ({
  value,
  unit = '',
  min = 0,
  max = Number.MAX_VALUE,
  negatives,
  positives,
  onChange,
}) => {
  const onChangeValue = (value: number) => {
    if (value < min) {
      value = min
    }
    if (value > max) {
      value = max
    }
    onChange?.(value)
  }

  const [isEdit, setIsEdit] = useState(false)

  return (
    <div className={styles.hNumber}>
      {negatives ? (
        negatives?.map((item) => (
          <Button
            key={item}
            size="small"
            onClick={() => onChangeValue?.(value + item)}
          >
            {item < 0 ? '' : ''}
            {item}
          </Button>
        ))
      ) : (
        <Button
          size="small"
          icon={<IconMinus />}
          onClick={() => onChangeValue?.(value - 1)}
        />
      )}
      <div className={clsx(styles.importantInfo, 'text-primary')}>
        {isEdit ? (
          <InputNumber
            size="small"
            value={value}
            onChange={(e) => onChangeValue?.(e || 0)}
            onBlur={() => setIsEdit(false)}
            style={{ width: 56, height: 22 }}
            autoFocus
          />
        ) : (
          <span className={styles.value} onClick={() => setIsEdit(true)}>
            {value}
          </span>
        )}
        <span className={styles.unit}>{unit}</span>
      </div>
      {positives ? (
        positives?.map((item) => (
          <Button
            key={item}
            size="small"
            onClick={() => onChangeValue?.(value + item)}
          >
            +{item}
          </Button>
        ))
      ) : (
        <Button
          size="small"
          icon={<IconPlus />}
          onClick={() => onChangeValue?.(value + 1)}
        />
      )}
    </div>
  )
}

export default memo(HNumber)
