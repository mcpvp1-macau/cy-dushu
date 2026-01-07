import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconVisible from '@/assets/icons/jsx/IconVisible'
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
        placement="bottomRight"
        disabled={!hasItems}
        open={open}
        onOpenChange={onOpenChange}
        menu={{
          items: menuItems,
        }}
      >
        <div className="text-fore flex gap-3 cursor-pointer bg-ground-2 px-3 border border-solid border-ground-5 rounded select-none">
          <IconCameraVideo />
          视频通道
          {/* TODO: 实现一键全部显示/隐藏，并改变对应 Icon 的状态 */}
          <IconButton>
            <IconVisible />
          </IconButton>
        </div>
      </Dropdown>
    </div>
  )
}

export default SmartCarVideoSelector
