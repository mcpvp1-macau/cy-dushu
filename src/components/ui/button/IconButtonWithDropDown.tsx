import { Dropdown, GetProps, Tooltip } from 'antd'
import IconButton from './IconButton'
import Tippy from '@tippyjs/react'

type PropsType = GetProps<typeof Dropdown> & {
  tippyProps?: GetProps<typeof Tippy>
  /** @deprecated Use tippyProps instead */
  tooltipProps?: GetProps<typeof Tooltip>
  className?: string
  active?: boolean
}

/** 图标按钮携带下拉菜单 */
const IconButtonWithDropDown: FC<PropsType> = memo(
  ({ children, tooltipProps, tippyProps, className, active, ...props }) => {
    const [open, setOpen] = useState(false)
    return (
      <Dropdown
        getPopupContainer={() =>
          (document.fullscreenElement as HTMLElement) ?? document.body
        }
        {...props}
        onOpenChange={(open, info) => {
          props.onOpenChange?.(open, info)
          setOpen(open)
        }}
      >
        <IconButton
          className={className}
          toolTipProps={open ? undefined : tooltipProps}
          tippyProps={open ? undefined : tippyProps}
          active={open || active}
        >
          {children}
        </IconButton>
      </Dropdown>
    )
  },
)

IconButtonWithDropDown.displayName = 'IconButtonWithDropDown'

export default IconButtonWithDropDown
