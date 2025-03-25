import IconClose from '@/assets/icons/jsx/IconClose'
import IconButton from '@/components/ui/button/IconButton'
import useFixedWindowsStore from '@/store/useFixedWindows.store'
import { limitNum } from '@/utils/math'
import { forwardRef, useImperativeHandle } from 'react'

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
    const handleMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation()
      startPosition.current = {
        x: e.clientX,
        y: e.clientY,
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

    const updateWindow = useFixedWindowsStore((s) => s.updateWindow)

    useEffect(() => {
      if (mouseAction === MouseActionType.None) {
        return
      }

      const maxWidth = document.body.clientWidth - 100
      const maxHeight = document.body.clientHeight - 62

      const handleMouseMove = (e: MouseEvent) => {
        if ((e.buttons & 1) !== 1) {
          setMouseAction(MouseActionType.None)
          return
        }
        if (MouseActionType.Move === mouseAction) {
          const dx = e.clientX - startPosition.current.x
          const dy = e.clientY - startPosition.current.y
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
          const dx = e.clientX - startPosition.current.x
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
          const dx = e.clientX - startPosition.current.x
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
          const dy = e.clientY - startPosition.current.y
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
          const dy = e.clientY - startPosition.current.y
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
          const dx = e.clientX - startPosition.current.x
          const dy = e.clientY - startPosition.current.y
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
          const dx = e.clientX - startPosition.current.x
          const dy = e.clientY - startPosition.current.y
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
          const dx = e.clientX - startPosition.current.x
          const dy = e.clientY - startPosition.current.y
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
          const dx = e.clientX - startPosition.current.x
          const dy = e.clientY - startPosition.current.y
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

      window.addEventListener('mousemove', handleMouseMove)
      window.document.body.style.userSelect = 'none'
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
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
    }))

    return (
      <div
        className={clsx('absolute pointer-events-auto', {
          'rounded border border-solid border-[#37414d]': !props.noBorder,
        })}
        style={{
          width: props.width,
          height: props.height,
          transform: `translate(${props.x}px, ${props.y}px)`,
        }}
      >
        {!props.noHeader && (
          <div
            className="flex justify-between items-center h-8 px-3 border-b border-solid bg-ground-1 border-[#37414d]"
            onMouseDown={(e) => {
              setMouseAction(MouseActionType.Move)
              handleMouseDown(e)
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
            />
            <div
              className="absolute right-0 inset-y-0 w-2 translate-x-1 cursor-ew-resize z-40"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeRight)
                handleMouseDown(e)
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
            />
            <div
              className="absolute bottom-0 inset-x-0 h-2 translate-y-1 cursor-ns-resize z-40"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeBottom)
                handleMouseDown(e)
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
            />
            <div
              className="absolute right-0 top-0 w-2 h-2 translate-x-1 -translate-y-1 cursor-nesw-resize z-50"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeTopRight)
                handleMouseDown(e)
              }}
            />
            <div
              className="absolute right-0 bottom-0 w-2 h-2 translate-x-1 translate-y-1 cursor-nwse-resize z-50"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeBottomRight)
                handleMouseDown(e)
              }}
            />
            <div
              className="absolute left-0 bottom-0 w-2 h-2 -translate-x-1 translate-y-1 cursor-nesw-resize z-50"
              onMouseDown={(e) => {
                setMouseAction(MouseActionType.ResizeBottomLeft)
                handleMouseDown(e)
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
