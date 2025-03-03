import { Dropdown, GetProps, Tooltip } from 'antd'
import IconButton from './IconButton'

type PropsType = GetProps<typeof Dropdown> & {
  tooltipProps?: GetProps<typeof Tooltip>
  className?: string
}

/** 图标按钮携带下拉菜单 */
const IconButtonWithDropDown: FC<PropsType> = memo(
  ({ children, tooltipProps, className, ...props }) => {
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
          active={open}
        >
          {children}
        </IconButton>
      </Dropdown>
    )
  },
)

IconButtonWithDropDown.displayName = 'IconButtonWithDropDown'

export default IconButtonWithDropDown
