import IconSignal4GNil from '@/assets/icons/jsx/IconSignal4GNil'
import { isNil } from 'lodash'
import { CSSProperties } from 'react'

type PropsType = {
  max?: number
  value: number
  width?: number
  height?: number
  style?: CSSProperties
  className?: string
}

/** 信号强度 */
const SignalStrength: FC<PropsType> = memo(
  ({ max = 5, value, width = 16, height = 16, style, className }) => {
    if (isNil(value) || value == -1) {
      return (
        <IconSignal4GNil
          width={width}
          height={height}
          style={style}
          className={className}
        />
      )
    }

    const radio = Math.floor((Number(value) / Number(max)) * 10) / 10

    return (
      <svg
        viewBox="0 0 200 200"
        width={width}
        height={height}
        style={style}
        className={className}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <rect
            key={index}
            x={`${index * 40}`}
            y={`${120 - index * 20}`}
            width="28"
            height={`${80 + index * 20}`}
            rx="10"
            fill={radio > index * 0.2 ? '#c7d1dc' : 'rgba(205, 205, 205, 0.5)'}
          />
        ))}
      </svg>
    )
  },
)

SignalStrength.displayName = 'SignalStrength'

export default SignalStrength
