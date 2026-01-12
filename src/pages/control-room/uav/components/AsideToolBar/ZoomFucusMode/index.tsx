import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { isNil } from 'lodash'
import { Mode, modeMap, modeZhMap } from './constants'
import IconButtonWithDropDown from '@/components/ui/button/IconButtonWithDropDown'
import { useVideoToolbarDropdown } from '@/components/VideoS/DeviceLiveVideo'

type PropsType = {
  postSerivce: ReturnType<typeof usePostDeviceService>
}

/** 镜头变焦模式 */
const ZoomFocusMode: FC<PropsType> = memo(({ postSerivce }) => {
  const { t } = useTranslation()
  const toolbarDropdown = useVideoToolbarDropdown()

  const zoomFocusMode: Mode = useUavControlRoomStore(
    (s) => s.state.zoomFocusMode,
  )

  const lensType = useUavControlRoomStore((s) => s.state.lensType)
  /** 提交变焦对焦模式切换 */
  const handleClick = ({ key }: { key: string }) => {
    postSerivce('changeZoomFocusMode', {
      mode: String(key),
      lens: lensType,
    })
  }

  /** 处理变焦模式下拉显隐联动 */
  const handleDropdownOpenChange = useMemoizedFn((open: boolean) => {
    // 下拉打开时锁定工具栏，避免误隐藏
    toolbarDropdown?.onOpenChange?.(open)
  })

  if (isNil(zoomFocusMode)) {
    return null
  }

  return (
    <IconButtonWithDropDown
      className="text-xs"
      tippyProps={{ content: t('controlRoom.uav.service.focusMode.title') }}
      menu={{
        items: Array.from(modeMap.entries()).map(([k, v]) => ({
          key: k,
          value: k,
          label: (
            <div className="flex flex-col items-center text-xs">
              <p>{v}</p>
              <p>{modeZhMap.get(k)}</p>
            </div>
          ),
          onClick: handleClick,
        })),
      }}
      disabled={!(lensType === 'wide' || lensType === 'zoom')}
      placement="top"
      trigger={['click']}
      onOpenChange={handleDropdownOpenChange}
    >
      {modeMap.get(zoomFocusMode)}
    </IconButtonWithDropDown>
  )
})

ZoomFocusMode.displayName = 'ZoomFocusMode'

export default ZoomFocusMode
