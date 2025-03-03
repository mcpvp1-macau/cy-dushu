import { Dropdown, GetProps, Tooltip } from 'antd'
import IconButton from './IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import { ReactNode } from 'react'

type PropsType = GetProps<typeof Dropdown> & {
  tooltipProps?: GetProps<typeof Tooltip>
  title: ReactNode
  className?: string
}

/** 图标按钮携带下拉菜单（对话框） */
const IconButtonWithDropDownDialog: FC<PropsType> = memo(
  ({ children, tooltipProps, className, title, ...props }) => {
    const [open, setOpen] = useState(false)

    return (
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
        dropdownRender={(originNode) => (
          <div className="bg-[#16202b] bg-opacity-90 backdrop-blur-sm rounded max-w-[400px] border border-solid border-ground-5">
            <div className="bg-ground-4 px-2 flex justify-between items-center border-b border-solid border-ground-5">
              <span className="text-white leading-8">{title}</span>
              <IconButton
                className="text-xl"
                onClick={() => {
                  console.log('1')
                  setOpen(false)
                }}
              >
                <IconClose />
              </IconButton>
            </div>
            {props.dropdownRender?.(originNode)}
          </div>
        )}
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

IconButtonWithDropDownDialog.displayName = 'IconButtonWithDropDownDialog'

export default IconButtonWithDropDownDialog
