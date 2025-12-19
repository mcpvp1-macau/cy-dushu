import IconClose from '@/assets/icons/jsx/IconClose'
import IconButton from '@/components/ui/button/IconButton'
import useFixedWindowsStore from '@/store/useFixedWindows.store'
import { limitNum } from '@/utils/math'
import { forwardRef, TouchEventHandler, useImperativeHandle } from 'react'

export enum MouseActionType {
  None,
  Move,
  ResizeTop,
  ResizeRight,
  ResizeBottom,
  ResizeLeft,
  ResizeTopRight,
  ResizeBottomRight,
  ResizeBottomLeft,
  ResizeTopLeft,
}

type PropsType = {
  id: string
  zIndex?: number
  x: number
  y: number
  width: number
  height: number
  title?: ReactNode
  /** 不需要 header */
  noHeader?: boolean
  /** 是否可调整左右大小 */
  resizeAbleX?: boolean
  /** 是否可调整上下大小 */
  resizeAbleY?: boolean
  children?: React.ReactNode
  /** 是否没有边框 */
  noBorder?: boolean
}

type RefType = {
  handleMouseDown: (e: React.MouseEvent) => void
  handleTouchStart: TouchEventHandler<HTMLDivElement>
  setMouseAction: (action: MouseActionType) => void
  handleClose: () => void
}

const BaseWindow = memo(
  forwardRef<RefType, PropsType>((props, ref) => {
    const startPosition = useRef({ x: 0, y: 0 })
    const startTransform = useRef({ x: props.x, y: props.y })
    const startSize = useRef({
      width: props.width,
      height: props.height,
    })
    const [mouseAction, setMouseAction] = useState(MouseActionType.None)

    // 重排 zIndex
    const resetZIndex = () => {
      const { windows } = useFixedWindowsStore.getState()
      const currentWindow = windows.find((w) => w.id === props.id)

      if (!currentWindow) {
        return
      }

      // 如果已经是最上层，则不处理
      if (currentWindow.zIndex === windows.length && windows.length > 0) {
        useFixedWindowsStore.setState({ activeWindowId: props.id })
        return
      }

      const otherWindowsSorted = windows
        .filter((w) => w.id !== props.id)
        .sort((a, b) => a.zIndex - b.zIndex)

      const updatedWindows = otherWindowsSorted.map((window, index) => ({
        ...window,
        zIndex: index + 1,
      }))

      updatedWindows.push({
        ...currentWindow,
        zIndex: windows.length,
      })

      useFixedWindowsStore.setState({
        windows: updatedWindows,
        maxZIndex: windows.length,
        activeWindowId: props.id,
      })
    }

    // 处理开始拖拽
    const handleStart = (x: number, y: number) => {
      startPosition.current = {
        x: x,
        y: y,
      }
      startTransform.current = {
        x: props.x,
        y: props.y,
      }
      startSize.current = {
        width: props.width,
        height: props.height,
      }
    }
    const handleMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation()
      resetZIndex()
      handleStart(e.clientX, e.clientY)
    }

    const handleTouchStart: TouchEventHandler<HTMLDivElement> = (e) => {
      e.stopPropagation()
      if (e.touches.length !== 1) {
        return
      }
      resetZIndex()
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      handleStart(x, y)
    }

    const updateWindow = useFixedWindowsStore((s) => s.updateWindow)

    useEffect(() => {
      if (mouseAction === MouseActionType.None) {
        return
      }

      const maxWidth = document.body.clientWidth - 100
      const maxHeight = document.body.clientHeight - 62

      const handleMove = (x: number, y: number) => {
        if (MouseActionType.Move === mouseAction) {
          const dx = x - startPosition.current.x
          const dy = y - startPosition.current.y
          updateWindow(props.id, {
            layout: {
              x: limitNum(
                startTransform.current.x + dx,
                0,
                window.innerWidth - 32,
              ),
              y: limitNum(
                startTransform.current.y + dy,
                0,
                window.innerHeight - 32,
              ),
              width: startSize.current.width,
              height: startSize.current.height,
            },
          })
        } else if (MouseActionType.ResizeLeft === mouseAction) {
          const dx = x - startPosition.current.x
          const newWidth = limitNum(startSize.current.width - dx, 100, maxWidth)
          updateWindow(props.id, {
            layout: {
              x: startTransform.current.x + dx,
              y: startTransform.current.y,
              width: newWidth,
              height: startSize.current.height,
            },
          })
        } else if (MouseActionType.ResizeRight === mouseAction) {
          const dx = x - startPosition.current.x
          const newWidth = limitNum(startSize.current.width + dx, 100, maxWidth)
          updateWindow(props.id, {
            layout: {
              x: startTransform.current.x,
              y: startTransform.current.y,
              width: newWidth,
              height: startSize.current.height,
            },
          })
        } else if (MouseActionType.ResizeTop === mouseAction) {
          const dy = y - startPosition.current.y
          const newHeight = limitNum(
            startSize.current.height - dy,
            100,
            maxHeight,
          )
          updateWindow(props.id, {
            layout: {
              x: startTransform.current.x,
              y: startTransform.current.y + dy,
              width: startSize.current.width,
              height: newHeight,
            },
          })
        } else if (MouseActionType.ResizeBottom === mouseAction) {
          const dy = y - startPosition.current.y
          const newHeight = limitNum(
            startSize.current.height + dy,
            100,
            maxHeight,
          )
          updateWindow(props.id, {
            layout: {
              x: startTransform.current.x,
              y: startTransform.current.y,
              width: startSize.current.width,
              height: newHeight,
            },
          })
        } else if (MouseActionType.ResizeTopRight === mouseAction) {
          const dx = x - startPosition.current.x
          const dy = y - startPosition.current.y
          const newWidth = limitNum(startSize.current.width + dx, 100, maxWidth)
          const newHeight = limitNum(
            startSize.current.height - dy,
            100,
            maxHeight,
          )
          updateWindow(props.id, {
            layout: {
              x: startTransform.current.x,
              y: startTransform.current.y + dy,
              width: newWidth,
              height: newHeight,
            },
          })
        } else if (MouseActionType.ResizeBottomRight === mouseAction) {
          const dx = x - startPosition.current.x
          const dy = y - startPosition.current.y
          const newWidth = limitNum(startSize.current.width + dx, 100, maxWidth)
          const newHeight = limitNum(
            startSize.current.height + dy,
            100,
            maxHeight,
          )
          updateWindow(props.id, {
            layout: {
              x: startTransform.current.x,
              y: startTransform.current.y,
              width: newWidth,
              height: newHeight,
            },
          })
        } else if (MouseActionType.ResizeBottomLeft === mouseAction) {
          const dx = x - startPosition.current.x
          const dy = y - startPosition.current.y
          const newWidth = limitNum(startSize.current.width - dx, 100, maxWidth)
          const newHeight = limitNum(
            startSize.current.height + dy,
            100,
            maxHeight,
          )
          updateWindow(props.id, {
            layout: {
              x: startTransform.current.x + dx,
              y: startTransform.current.y,
              width: newWidth,
              height: newHeight,
            },
          })
        } else if (MouseActionType.ResizeTopLeft === mouseAction) {
          const dx = x - startPosition.current.x
          const dy = y - startPosition.current.y
          const newWidth = limitNum(startSize.current.width - dx, 100, maxWidth)
          const newHeight = limitNum(
            startSize.current.height - dy,
            100,
            maxHeight,
          )
          updateWindow(props.id, {
            layout: {
              x: startTransform.current.x + dx,
              y: startTransform.current.y + dy,
              width: newWidth,
              height: newHeight,
            },
          })
        }
      }

      const handleMouseMove = (e: MouseEvent) => {
        if ((e.buttons & 1) !== 1) {
          setMouseAction(MouseActionType.None)
          return
        }
        handleMove(e.clientX, e.clientY)
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length !== 1) {
          return
        }
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }

      const handleEnd = () => {
        setMouseAction(MouseActionType.None)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('mouseup', handleEnd)
      window.addEventListener('touchend', handleEnd)
      window.document.body.style.userSelect = 'none'
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('mouseup', handleEnd)
        window.removeEventListener('touchend', handleEnd)
        window.document.body.style.userSelect = ''
      }
    }, [mouseAction])

    const handleClose = () => {
      useFixedWindowsStore.getState().removeWindow(props.id)
    }

    const { resizeAbleX = true, resizeAbleY = true } = props

    useImperativeHandle(ref, () => ({
      handleMouseDown,
      setMouseAction,
      handleClose,
      handleTouchStart,
    }))

    return (
      <div
        className={clsx('absolute pointer-events-auto', {
          'rounded border border-solid border-ground-5': !props.noBorder,
        })}
        style={{
          width: props.width,
          height: props.height,
          zIndex: props.zIndex,
          transform: `translate(${props.x}px, ${props.y}px)`,
        }}
      >
        {!props.noHeader && (
          <div
            className="flex justify-between items-center h-8 px-3 border-b border-solid bg-ground-1 border-ground-5"
            onMouseDown={(e) => {
              setMouseAction(MouseActionType.Move)
              handleMouseDown(e)
            }}
            onTouchStart={(e) => {
              setMouseAction(MouseActionType.Move)
              handleTouchStart(e)
            }}
          >
            <div className="text-sm select-none">{props.title}</div>
            <IconButton onClick={handleClose}>
              <IconClose className="scale-125" />
            </IconButton>
          </div>
        )}
        <div
          className="w-full rounded overflow-hidden"
          style={{ height: props.height - (props.noHeader ? 0 : 34) }}
        >
          {props.children}
        </div>
        {resizeAbleX && (
          <>
            <div
              className="absolute left-0 inset-y-0 w-2 -translate-x-1 cursor-ew-resize z-40"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeLeft)
                handleMouseDown(e)
              }}
              onTouchStart={(e) => {
                setMouseAction(MouseActionType.ResizeLeft)
                handleTouchStart(e)
              }}
            />
            <div
              className="absolute right-0 inset-y-0 w-2 translate-x-1 cursor-ew-resize z-40"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeRight)
                handleMouseDown(e)
              }}
              onTouchStart={(e) => {
                setMouseAction(MouseActionType.ResizeRight)
                handleTouchStart(e)
              }}
            />
          </>
        )}
        {resizeAbleY && (
          <>
            <div
              className="absolute top-0 inset-x-0 h-2 -translate-y-1 cursor-ns-resize z-40"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeTop)
                handleMouseDown(e)
              }}
              onTouchStart={(e) => {
                setMouseAction(MouseActionType.ResizeTop)
                handleTouchStart(e)
              }}
            />
            <div
              className="absolute bottom-0 inset-x-0 h-2 translate-y-1 cursor-ns-resize z-40"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeBottom)
                handleMouseDown(e)
              }}
              onTouchStart={(e) => {
                setMouseAction(MouseActionType.ResizeBottom)
                handleTouchStart(e)
              }}
            />
          </>
        )}
        {resizeAbleX && resizeAbleY && (
          <>
            <div
              className="absolute left-0 top-0 w-2 h-2 -translate-x-1 -translate-y-1 cursor-nwse-resize z-50"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeTopLeft)
                handleMouseDown(e)
              }}
              onTouchStart={(e) => {
                setMouseAction(MouseActionType.ResizeTopLeft)
                handleTouchStart(e)
              }}
            />
            <div
              className="absolute right-0 top-0 w-2 h-2 translate-x-1 -translate-y-1 cursor-nesw-resize z-50"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeTopRight)
                handleMouseDown(e)
              }}
              onTouchStart={(e) => {
                setMouseAction(MouseActionType.ResizeTopRight)
                handleTouchStart(e)
              }}
            />
            <div
              className="absolute right-0 bottom-0 w-2 h-2 translate-x-1 translate-y-1 cursor-nwse-resize z-50"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeBottomRight)
                handleMouseDown(e)
              }}
              onTouchStart={(e) => {
                setMouseAction(MouseActionType.ResizeBottomRight)
                handleTouchStart(e)
              }}
            />
            <div
              className="absolute left-0 bottom-0 w-2 h-2 -translate-x-1 translate-y-1 cursor-nesw-resize z-50"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeBottomLeft)
                handleMouseDown(e)
              }}
              onTouchStart={(e) => {
                setMouseAction(MouseActionType.ResizeBottomLeft)
                handleTouchStart(e)
              }}
            />
          </>
        )}
      </div>
    )
  }),
)

BaseWindow.displayName = 'BaseWindow'

export default BaseWindow
