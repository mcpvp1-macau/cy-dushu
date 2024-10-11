import { useMemoizedFn, useRafState } from 'ahooks'
import { MouseEventHandler, memo, useRef, type FC } from 'react'

type PropsType = {
  /** rect: x0, y0, x1, y1 */
  onDrawEnd?: (rect: [number, number, number, number]) => void
}

/** 画框: 百分比 */
const DrawBox: FC<PropsType> = memo(({ onDrawEnd }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const isDrawing = useRef(false)
  const startPosition = useRef({ x: 0, y: 0 })
  const [rect, setRect] = useRafState<[number, number, number, number]>([
    0, 0, 0, 0,
  ])

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useMemoizedFn(
    (e) => {
      if (isDrawing.current || !ref.current) {
        return
      }
      if ((e.buttons & 1) !== 1) {
        isDrawing.current = false
        return
      }
      isDrawing.current = true
      const x = e.nativeEvent.offsetX
      const y = e.nativeEvent.offsetY
      startPosition.current = {
        x,
        y,
      }
      setRect([
        x / ref.current.offsetWidth,
        y / ref.current.offsetHeight,
        x / ref.current.offsetWidth,
        y / ref.current.offsetHeight,
      ])
    },
  )

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = useMemoizedFn(
    (e) => {
      if (!isDrawing.current || !ref.current) {
        return
      }
      const x = e.nativeEvent.offsetX
      const y = e.nativeEvent.offsetY

      setRect([
        Math.max(
          0,
          Math.min(startPosition.current.x, x) / ref.current?.offsetWidth,
        ),
        Math.max(
          0,
          Math.min(startPosition.current.y, y) / ref.current?.offsetHeight,
        ),
        Math.min(
          1,
          Math.max(startPosition.current.x, x) / ref.current?.offsetWidth,
        ),
        Math.min(
          Math.max(startPosition.current.y, y) / ref.current?.offsetHeight,
        ),
      ])
    },
  )

  const handleMouseUp = useMemoizedFn(() => {
    isDrawing.current = false
    onDrawEnd?.(rect)
    setTimeout(() => {
      setRect([0, 0, 0, 0])
    }, 300)
  })

  return (
    <div
      className="absolute inset-0"
      style={{
        zIndex: isDrawing.current ? 99889998 : 98,
        cursor: 'crosshair',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={ref}
    >
      {rect[2] > 0 && rect[3] > 0 && (
        <div
          style={{
            position: 'absolute',
            left: `${rect[0] * 100}%`,
            top: `${rect[1] * 100}%`,
            right: `${(1 - rect[2]) * 100}%`,
            bottom: `${(1 - rect[3]) * 100}%`,
            border: '1px solid red',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
})

DrawBox.displayName = 'DrawBox'

export default DrawBox
