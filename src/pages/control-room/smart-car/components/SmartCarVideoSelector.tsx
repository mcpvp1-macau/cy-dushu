import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconButton from '@/components/ui/button/IconButton'
import { Dropdown, type MenuProps } from 'antd'
import type { MouseEvent } from 'react'
import type { SmartCarVideoItem } from './SmartCarVideoWall'

type SmartCarVideoSelectorProps = {
  videoItems: SmartCarVideoItem[]
  isAllVideoSelected: boolean
  onToggleAll: () => void
  menuItems: MenuProps['items']
  open: boolean
  onOpenChange: (open: boolean, info?: { source?: 'trigger' | 'menu' }) => void
}

const SmartCarVideoSelector: FC<SmartCarVideoSelectorProps> = (props) => {
  const { t } = useTranslation()
  const { videoItems, isAllVideoSelected, onToggleAll, menuItems, open, onOpenChange } =
    props

  const hasItems = (menuItems?.length ?? 0) > 0

  const handleToggleAll = useMemoizedFn((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onToggleAll()
  })

  const toggleIcon = isAllVideoSelected ? <IconVisible /> : <IconNotVisible />
  const toggleText = isAllVideoSelected
    ? t('common.hideAll', { defaultValue: '全部隐藏' })
    : t('common.showAll', { defaultValue: '全部显示' })

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
          {t('controlRoom.smartCar.videoChannel', { defaultValue: '视频通道' })}
          <IconButton disabled={!videoItems.length} onClick={handleToggleAll}>
            <span className="sr-only">{toggleText}</span>
            {toggleIcon}
          </IconButton>
        </div>
      </Dropdown>
    </div>
  )
}

export default SmartCarVideoSelector
