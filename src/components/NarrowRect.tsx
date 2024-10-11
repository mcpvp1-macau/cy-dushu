import { useRafState, useSize, useThrottleEffect } from 'ahooks'
import { memo, useRef, type FC } from 'react'
import { omit } from 'lodash'

type PropsType = React.HTMLAttributes<HTMLDivElement> & {
  multiplier: number
  color?: string
  useLabel?: boolean
}

const rects = [
  'left-0 top-0 w-[42%] h-[3px]',
  'right-0 top-0 w-[42%] h-[3px]',
  'left-0 top-0 h-[42%] w-[3px]',
  'left-0 bottom-0 h-[42%] w-[3px]',
  'left-0 bottom-0 w-[42%] h-[3px]',
  'right-0 bottom-0 w-[42%] h-[3px]',
  'right-0 top-0 h-[42%] w-[3px]',
  'right-0 bottom-0 h-[42%] w-[3px]',
]

/** 变焦缩放器, 根据外界的大小 (外界需要为 1x 的情况下) */
const NarrowRect: FC<PropsType> = memo(
  ({ multiplier, color = '#34d399', useLabel = true, ...restProps }) => {
    const boxRef = useRef<HTMLDivElement>(null)
    const size = useSize(boxRef)
    const [narrowRect, setNarrowRect] = useRafState<[number, number]>([0, 0])

    useThrottleEffect(
      () => {
        if (!size) {
          return
        }
        const w = size.width / multiplier
        const h = size.height / multiplier
        setNarrowRect([w, h])
      },
      [size, multiplier],
      { wait: 0x3f, trailing: true },
    )

    return (
      <div
        ref={boxRef}
        className={clsx(
          'absolute left-0 top-0 bottom-0 right-0  pointer-events-none',
          restProps.className,
        )}
        {...omit(restProps, 'className')}
      >
        <div
          className="absolute left-1/2 top-1/2 flex flex-wrap gap-3"
          style={{
            width: narrowRect[0],
            height: narrowRect[1],
            transform: 'translate(-50%, -50%)',
          }}
        >
          {rects.map((rect) => (
            <div
              key={rect}
              className={clsx('absolute shadow', rect)}
              style={{ background: color }}
            />
          ))}
          {useLabel && (
            <span
              className={clsx('absolute bottom-0 right-0 text-sm select-none')}
              style={{
                transform: 'translateY(100%)',
                textShadow: '1px 1px 1px #0009',
                color: color,
              }}
            >
              {multiplier}x
            </span>
          )}
        </div>
      </div>
    )
  },
)

NarrowRect.displayName = 'NarrowRect'

export default NarrowRect
