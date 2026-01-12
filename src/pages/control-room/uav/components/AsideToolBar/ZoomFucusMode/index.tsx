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
  const isLensAvailable = lensType === 'wide' || lensType === 'zoom'

  /** 生成变焦对焦模式下拉菜单 */
  const zoomFocusModeMenu = useMemo(() => {
    /** 提交变焦对焦模式切换 */
    const handleClick = ({ key }: { key: string }) => {
      // 业务规则：未选定镜头时不下发对焦模式
      if (!isLensAvailable) {
        return
      }

      postSerivce('changeZoomFocusMode', {
        mode: String(key),
        lens: lensType,
      })
    }

    const items = Array.from(modeMap.entries()).map(([key]) => ({
      key,
      value: key,
      label: (
        <div className="flex flex-col items-center text-xs">
          <p>
            {t(`controlRoom.uav.service.focusMode.mode.${key}`, {
              defaultValue: modeMap.get(key) ?? '',
            })}
          </p>
          <p>
            {t(`controlRoom.uav.service.focusMode.modeDesc.${key}`, {
              defaultValue: modeZhMap.get(key) ?? '',
            })}
          </p>
        </div>
      ),
    }))

    return {
      items,
      onClick: handleClick,
    }
  }, [isLensAvailable, lensType, postSerivce, t])

  /** 处理变焦模式下拉显隐联动 */
  const handleDropdownOpenChange = useMemoizedFn((open: boolean) => {
    // 下拉打开时锁定工具栏，避免误隐藏
    toolbarDropdown?.onOpenChange?.(open)
  })

  const zoomFocusModeText = useMemo(() => {
    return t(`controlRoom.uav.service.focusMode.mode.${zoomFocusMode}`, {
      defaultValue: modeMap.get(zoomFocusMode) ?? '',
    })
  }, [t, zoomFocusMode])

  if (isNil(zoomFocusMode)) {
    // 边界情况：变焦对焦模式为空时不显示按钮
    return null
  }

  return (
    <IconButtonWithDropDown
      className="text-xs"
      tippyProps={{
        content: t('controlRoom.uav.service.focusMode.title', {
          defaultValue: '对焦模式',
        }),
      }}
      menu={zoomFocusModeMenu}
      disabled={!isLensAvailable}
      placement="top"
      trigger={['click']}
      onOpenChange={handleDropdownOpenChange}
    >
      {zoomFocusModeText}
    </IconButtonWithDropDown>
  )
})

ZoomFocusMode.displayName = 'ZoomFocusMode'

export default ZoomFocusMode
