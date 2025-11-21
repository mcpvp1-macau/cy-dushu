import { Dropdown, GetProps, Tooltip } from 'antd'
import IconButton from './IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import { ReactNode } from 'react'
import { v4 } from 'uuid'
import IconDing from '@/assets/icons/jsx/IconDing'
import { createPortal } from 'react-dom'
import { limitNum } from '@/utils/math'

type PropsType = GetProps<typeof Dropdown> & {
  tooltipProps?: GetProps<typeof Tooltip>
  title: ReactNode
  useDing?: boolean
  className?: string
}

/** 图标按钮携带下拉菜单（对话框） */
const IconButtonWithDropDownDialog: FC<PropsType> = memo(
  ({ children, tooltipProps, className, title, useDing = false, ...props }) => {
    const [open, setOpen] = useState(false)
    const dropId = useRef<string | null>(null)
    if (!dropId.current) {
      dropId.current = v4()
    }

    const [isDing, setIsDing] = useState(false)

    const originalNodeRef = useRef<ReactNode | null>(null)

    useEffect(() => {
      if (open) {
        const drop = document.querySelector(
          `.x-dropdown${dropId.current ?? 'never'}`,
        ) as HTMLElement
        if (!drop) {
          return
        }

        const fn = () => {
          const rect = drop.getBoundingClientRect()
          setPosition({ x: rect.x, y: rect.y })
        }

        drop.addEventListener('animationend', fn)
        return () => {
          drop.removeEventListener('animationend', fn)
        }
      }
    }, [open])

    const closeBtn = (
      <IconButton
        className="text-xl"
        onClick={() => {
          setOpen(false)
          setIsDing(false)
        }}
      >
        <IconClose />
      </IconButton>
    )

    const startPosition = useRef({ x: 0, y: 0 })
    const startMousePosition = useRef({ x: 0, y: 0 })
    const [mouseAction, setMouseAction] = useState(0)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation()
      startMousePosition.current = {
        x: 'touches' in e ? e.touches[0].clientX : e.clientX,
        y: 'touches' in e ? e.touches[0].clientY : e.clientY,
      }
      startPosition.current = {
        x: position.x,
        y: position.y,
      }
      document.body.style.userSelect = 'none'
      setMouseAction(1)
    }

    useEffect(() => {
      if (mouseAction === 0) {
        return
      }

      const handleMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startMousePosition.current.x
        const dy = e.clientY - startMousePosition.current.y
        setPosition({
          x: limitNum(startPosition.current.x + dx, 0, window.innerWidth - 32),
          y: limitNum(startPosition.current.y + dy, 0, window.innerHeight - 32),
        })
      }

      const handleMouseUp = () => {
        setMouseAction(0)
        document.body.style.userSelect = 'auto'
        window.getSelection()?.removeAllRanges()
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }, [mouseAction])

    return (
      <>
        <Dropdown
          open={open}
          getPopupContainer={() =>
            (document.fullscreenElement as HTMLElement) ?? document.body
          }
          {...props}
          onOpenChange={(open, info) => {
            props.onOpenChange?.(open, info)
            setOpen(open)
          }}
          overlayClassName={clsx(
            'x-dropdown' + dropId.current,
            props.overlayClassName,
          )}
          popupRender={(originNode) => {
            if (isDing) {
              return <></>
            }
            return (
              <div className="bg-ground-1/90 backdrop-blur-sm rounded max-w-[400px] border border-solid border-ground-5 text-sm text-fore">
                <div className="bg-ground-4 px-2 flex justify-between items-center gap-3 border-b border-solid border-ground-5">
                  <span className="text-highlight leading-8">{title}</span>
                  <div className="flex items-center gap-1">
                    {useDing && (
                      <IconButton
                        onClick={() => {
                          setIsDing(true)
                          originalNodeRef.current = originNode
                        }}
                      >
                        <IconDing />
                      </IconButton>
                    )}
                    {closeBtn}
                  </div>
                </div>
                {props.popupRender?.(originNode)}
              </div>
            )
          }}
        >
          <IconButton
            className={className}
            toolTipProps={open ? undefined : tooltipProps}
            active={open || isDing}
          >
            {children}
          </IconButton>
        </Dropdown>
        {isDing &&
          createPortal(
            <div
              className="fixed left-0 top-0 z-50"
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
              }}
            >
              <div className="bg-ground-1/90 backdrop-blur-sm rounded max-w-[400px] border border-solid border-ground-5 text-sm text-fore">
                <div
                  className="bg-ground-4 px-2 flex justify-between items-center gap-3 border-b border-solid border-ground-5"
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleMouseDown}
                >
                  <span className="text-white leading-8">{title}</span>
                  {closeBtn}
                </div>
                {props.popupRender?.(originalNodeRef.current)}
              </div>
            </div>,
            document.body,
          )}
      </>
    )
  },
)

IconButtonWithDropDownDialog.displayName = 'IconButtonWithDropDownDialog'

export default IconButtonWithDropDownDialog
