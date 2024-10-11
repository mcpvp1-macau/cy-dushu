import { Dropdown, GetProps, Tooltip } from 'antd'
import { memo, type FC } from 'react'
import IconButton from './ui/button/IconButton'

type PropsType = GetProps<typeof Dropdown> & {
  tooltipProps?: GetProps<typeof Tooltip>
}

const IconButtonWithDropDown: FC<PropsType> = memo(
  ({ children, tooltipProps, ...props }) => {
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
        <IconButton toolTipProps={tooltipProps} active={open}>
          {children}
        </IconButton>
      </Dropdown>
    )
  },
)

IconButtonWithDropDown.displayName = 'MenuIconButton'

export default IconButtonWithDropDown
