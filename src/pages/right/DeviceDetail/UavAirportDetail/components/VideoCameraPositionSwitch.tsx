import IconCameraSwitch from '@/assets/jsx/IconCameraSwitch'
import IconButtonWithDropDown from '@/components/ui/button/IconButtonWithDropDown'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import type { MenuProps } from 'antd'

type PropsType = {
  cameraPosition?: number | null
  deviceId: string
  productKey: string
  videoId: string
}

/** 机场视频舱内外镜头切换入口 */
const VideoCameraPositionSwitch: FC<PropsType> = memo(
  ({ cameraPosition, deviceId, productKey, videoId }) => {
    const { t } = useTranslation()
    const postDeviceService = usePostDeviceService(productKey, deviceId)

    const hasCameraPosition =
      cameraPosition !== null && cameraPosition !== undefined

    /** 提交切换舱内外镜头的控制指令 */
    const handleCameraPositionChange = useMemoizedFn((value: string) => {
      const nextPosition = Number(value)

      if (Number.isNaN(nextPosition)) {
        return
      }

      // 仅在视频流可用时切换舱内/舱外镜头
      postDeviceService('liveCameraChange', {
        cameraPosition: nextPosition,
        videoId,
      })
    })

    const cameraPositionItems = useMemo(
      () => [
        {
          label: t('device.uavDock.cameraPosition.inside', {
            defaultValue: '舱内',
          }),
          key: '0',
        },
        {
          label: t('device.uavDock.cameraPosition.outside', {
            defaultValue: '舱外',
          }),
          key: '1',
        },
      ],
      [t],
    )

    const menuItems = useMemo(
      () =>
        cameraPositionItems.map((item) => ({
          ...item,
        })),
      [cameraPositionItems],
    )

    /** 响应下拉菜单点击事件 */
    const handleMenuClick: MenuProps['onClick'] = useMemoizedFn(({ key }) => {
      handleCameraPositionChange(String(key))
    })

    if (!hasCameraPosition) {
      return null
    }

    return (
      <IconButtonWithDropDown
        placement="bottomRight"
        trigger={['click']}
        menu={{
          items: menuItems,
          selectedKeys: [String(cameraPosition)],
          onClick: handleMenuClick,
        }}
        tippyProps={{
          content: t('device.uavDock.cameraPosition.title', {
            defaultValue: '切换镜头',
          }),
        }}
        className="text-base"
      >
        <IconCameraSwitch />
      </IconButtonWithDropDown>
    )
  },
)

VideoCameraPositionSwitch.displayName = 'VideoCameraPositionSwitch'

export default VideoCameraPositionSwitch
