import { memo, useState, type FC } from 'react'
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
  className?: string
}

const HNumber: FC<PropsType> = ({
  value,
  unit = '',
  min = 0,
  max = Number.MAX_VALUE,
  negatives,
  positives,
  onChange,
  className,
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
    <div
      className={clsx(
        'w-full flex justify-between gap-3 items-center',
        className,
      )}
    >
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
      <div className={clsx('flex-1 text-[18px] text-center', 'text-primary')}>
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
          <span
            className="hover:underline cursor-pointer"
            onClick={() => setIsEdit(true)}
          >
            {value}
          </span>
        )}
        <span className="text-white text-sm ml-0.5">{unit}</span>
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
