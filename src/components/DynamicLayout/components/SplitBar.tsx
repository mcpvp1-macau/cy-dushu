type PropsType = {
  index: number
  vertical?: boolean
  onStartResize?: (offsetX: number, offsetY: number, index: number) => void
  onResize?: (offsetX: number, offsetY: number) => void
  onSizeEnd?: () => void
}

const SplitBar: FC<PropsType> = memo(
  ({ vertical, index, onStartResize, onResize, onSizeEnd }) => {
    const [dragging, { setTrue, setFalse }] = useBoolean(false)

    const handleDown = (e: React.MouseEvent) => {
      onStartResize?.(e.clientX, e.clientY, index)
      setTrue()
    }

    const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length !== 1) {
        return
      }
      const touch = e.touches[0]
      onStartResize?.(touch.clientX, touch.clientY, index)
      setTrue()
    }

    useEffect(() => {
      if (!dragging) return

      window.document.body.style.cursor = vertical ? 'ns-resize' : 'ew-resize'
      window.document.body.style.userSelect = 'none'

      const moveHandler = (e: MouseEvent) => {
        onResize?.(e.clientX, e.clientY)
      }

      const touchMoveHandler = (e: TouchEvent) => {
        if (e.touches.length !== 1) {
          return
        }
        onResize?.(e.touches[0].clientX, e.touches[0].clientY)
      }

      const mouseupHandler = () => {
        setFalse()
        window.document.body.style.cursor = ''
        window.document.body.style.userSelect = ''
        onSizeEnd?.()
      }

      window.addEventListener('mousemove', moveHandler)
      window.addEventListener('mouseup', mouseupHandler)
      window.addEventListener('touchmove', touchMoveHandler)
      window.addEventListener('touchend', mouseupHandler)

      return () => {
        window.removeEventListener('mousemove', moveHandler)
        window.removeEventListener('mouseup', mouseupHandler)
        window.removeEventListener('touchmove', touchMoveHandler)
        window.removeEventListener('touchend', mouseupHandler)
      }
    }, [dragging])

    return (
      <div
        className={clsx(
          'group bg-ground-1 relative flex-shrink-0 flex-grow-0',
          {
            'h-full w-2 cursor-ew-resize': !vertical,
            'w-full h-2 cursor-ns-resize': vertical,
          },
        )}
        onMouseDown={handleDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className={clsx(
            {
              'h-6 w-0.5': !vertical,
              'w-6 h-0.5': vertical,
            },
            'abs-center bg-ground-5 group-hover:bg-primary rounded',
          )}
        />
        <div
          className={clsx('abs-center group-hover:bg-primary rounded', {
            'h-full w-0.5': !vertical,
            'w-full h-0.5': vertical,
            'bg-primary': dragging,
          })}
        ></div>
      </div>
    )
  },
)

SplitBar.displayName = 'SplitBar'

export default SplitBar
