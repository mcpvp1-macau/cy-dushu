import { memo, type FC } from 'react'

type PropsType = {
  size?: number
  strokeWidth?: number
  color?: string
}

/** 准星 */
const Sight: FC<PropsType> = memo(
  ({ size = 30, strokeWidth = 6, color = 'white' }) => {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" stroke={color}>
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={i} transform={`rotate(${90 * i}, 50, 50)`}>
            <line x1="50" y1="0" x2="50" y2="38" strokeWidth={strokeWidth} />
          </g>
        ))}
      </svg>
    )
  },
)

Sight.displayName = 'Sight'

export default Sight
