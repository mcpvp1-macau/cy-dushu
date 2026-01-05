import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconButton from '@/components/ui/button/IconButton'
import { Dropdown, type MenuProps } from 'antd'

type SmartCarVideoSelectorProps = {
  menuItems: MenuProps['items']
  open: boolean
  onOpenChange: (open: boolean, info?: { source?: 'trigger' | 'menu' }) => void
}

const SmartCarVideoSelector: FC<SmartCarVideoSelectorProps> = (props) => {
  const { menuItems, open, onOpenChange } = props

  const hasItems = (menuItems?.length ?? 0) > 0

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <Dropdown
        trigger={['click']}
        disabled={!hasItems}
        open={open}
        onOpenChange={onOpenChange}
        menu={{
          items: menuItems,
        }}
      >
        <IconButton className="text-blue-500">
          <IconCameraVideo />
        </IconButton>
      </Dropdown>
    </div>
  )
}

export default SmartCarVideoSelector
