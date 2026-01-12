import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { isNil } from 'lodash'
import IconButtonWithDropDown from '@/components/ui/button/IconButtonWithDropDown'
import { useVideoToolbarDropdown } from '@/components/VideoS/DeviceLiveVideo'

type PropsType = {
  postSerivce: ReturnType<typeof usePostDeviceService>
}

/** 镜头曝光模式 */
const ExposureMode: FC<PropsType> = memo(({ postSerivce }) => {
  const { t } = useTranslation()
  const toolbarDropdown = useVideoToolbarDropdown()

  const zoomExposureMode = useUavControlRoomStore(
    (s) => s.state.zoomExposureMode,
  )
  const wideExposureMode = useUavControlRoomStore(
    (s) => s.state.wideExposureMode,
  )

  const lensType = useUavControlRoomStore((s) => s.state.lensType)
  const exposureMode = lensType === 'wide' ? wideExposureMode : zoomExposureMode
  const isLensAvailable = lensType === 'wide' || lensType === 'zoom'

  /** 生成曝光模式下拉菜单 */
  const exposureModeMenu = useMemo(() => {
    /** 提交曝光模式切换 */
    const handleClick = ({ key }: { key: string }) => {
      // 业务规则：未选定镜头时不下发曝光模式
      if (!isLensAvailable) {
        return
      }

      postSerivce('cameraExposureModeSet', {
        mode: String(key),
        lens: lensType,
      })
    }

    return {
      items: [
        {
          key: 1,
          label: t('controlRoom.uav.service.exposureMode.exposurePriority', {
            defaultValue: '曝光优先',
          }),
        },
        {
          key: 4,
          label: t('controlRoom.uav.service.exposureMode.shutterPriority', {
            defaultValue: '快门优先',
          }),
        },
      ],
      onClick: handleClick,
    }
  }, [isLensAvailable, lensType, postSerivce, t])

  /** 处理曝光模式下拉显隐联动 */
  const handleDropdownOpenChange = useMemoizedFn((open: boolean) => {
    // 下拉打开时锁定工具栏，避免误隐藏
    toolbarDropdown?.onOpenChange?.(open)
  })

  const exposureModeText = useMemo(() => {
    switch (exposureMode) {
      case 1:
        return t('controlRoom.uav.service.exposureMode.exposurePriority', {
          defaultValue: '曝光优先',
        })
      case 2:
        return t('controlRoom.uav.service.exposureMode.shutterPriorityExposure', {
          defaultValue: '快门优先曝光',
        })
      case 3:
        return t('controlRoom.uav.service.exposureMode.aperturePriorityExposure', {
          defaultValue: '光圈优先曝光',
        })
      case 4:
        return t('controlRoom.uav.service.exposureMode.shutterExposure', {
          defaultValue: '快门曝光',
        })
      default:
        return ''
    }
  }, [exposureMode, t])

  if (isNil(zoomExposureMode) && isNil(wideExposureMode)) {
    // 边界情况：两种镜头曝光模式都为空时不显示按钮
    return null
  }

  return (
    <IconButtonWithDropDown
      className="text-xs"
      tippyProps={{
        content: t('controlRoom.uav.service.exposureMode.title', {
          defaultValue: '镜头曝光模式',
        }),
      }}
      menu={exposureModeMenu}
      disabled={!isLensAvailable}
      placement="top"
      trigger={['click']}
      onOpenChange={handleDropdownOpenChange}
    >
      {exposureModeText}
    </IconButtonWithDropDown>
  )
})

ExposureMode.displayName = 'ZoomFocusMode'

export default ExposureMode
