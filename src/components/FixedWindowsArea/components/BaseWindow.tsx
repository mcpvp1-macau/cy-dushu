import IconClose from '@/assets/icons/jsx/IconClose'
import IconButton from '@/components/ui/button/IconButton'
import useFixedWindowsStore from '@/store/useFixedWindows.store'
import { limitNum } from '@/utils/math'
import { ReactNode } from 'react'

enum MouseActionType {
  None = 0,
  Move = 1,
  ResizeTop = 2,
  ResizeRight = 3,
  ResizeBottom = 4,
  ResizeLeft = 5,
  ResizeTopRight = 6,
  ResizeBottomRight = 7,
  ResizeBottomLeft = 8,
  ResizeTopLeft = 9,
}

type PropsType = {
  id: string
  zIndex?: number
  x: number
  y: number
  width: number
  height: number
  title?: ReactNode
  children?: React.ReactNode
}

const BaseWindow: FC<PropsType> = memo((props) => {
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
        const newWidth = limitNum(startSize.current.width - dx, 100, 800)
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
        const newWidth = limitNum(startSize.current.width + dx, 100, 800)
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
        const newHeight = limitNum(startSize.current.height - dy, 100, 600)
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
        const newHeight = limitNum(startSize.current.height + dy, 100, 600)
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
        const newWidth = limitNum(startSize.current.width + dx, 100, 800)
        const newHeight = limitNum(startSize.current.height - dy, 100, 600)
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
        const newWidth = limitNum(startSize.current.width + dx, 100, 800)
        const newHeight = limitNum(startSize.current.height + dy, 100, 600)
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
        const newWidth = limitNum(startSize.current.width - dx, 100, 800)
        const newHeight = limitNum(startSize.current.height + dy, 100, 600)
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
        const newWidth = limitNum(startSize.current.width - dx, 100, 800)
        const newHeight = limitNum(startSize.current.height - dy, 100, 600)
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

  return (
    <div
      className="absolute pointer-events-auto bg-ground-1 rounded border border-solid border-[#37414d]"
      style={{
        width: props.width,
        height: props.height,
        transform: `translate(${props.x}px, ${props.y}px)`,
      }}
    >
      <div
        className="flex justify-between items-center h-8 px-3 border-b border-solid border-[#37414d] bg-[#28323c]"
        onMouseDown={(e) => {
          setMouseAction(MouseActionType.Move)
          handleMouseDown(e)
        }}
      >
        <div className="text-sm select-none">{props.title}</div>
        <IconButton
          onClick={() => useFixedWindowsStore.getState().removeWindow(props.id)}
        >
          <IconClose className="scale-125" />
        </IconButton>
      </div>
      <div
        className="w-full bg-black rounded overflow-hidden"
        style={{ height: props.height - 34 }}
      >
        {props.children}
      </div>
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
    </div>
  )
})

BaseWindow.displayName = 'BaseWindow'

export default BaseWindow
