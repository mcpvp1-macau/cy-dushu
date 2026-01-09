import LinkSwitch from '@/components/LinkSwitch'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useMemoizedFn } from 'ahooks'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type PropsType = {
  cameraPosition?: number | null
  deviceId: string
  productKey: string
  videoId: string
}

const VideoCameraPositionSwitch: FC<PropsType> = memo(
  ({ cameraPosition, deviceId, productKey, videoId }) => {
    const { t } = useTranslation()
    const postDeviceService = usePostDeviceService(productKey, deviceId)

    const hasCameraPosition =
      cameraPosition !== null && cameraPosition !== undefined

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
          value: '0',
        },
        {
          label: t('device.uavDock.cameraPosition.outside', {
            defaultValue: '舱外',
          }),
          value: '1',
        },
      ],
      [t],
    )

    if (!hasCameraPosition) {
      return <div className="text-sm">{t('common.live')}</div>
    }

    return (
      <LinkSwitch
        items={cameraPositionItems}
        value={String(cameraPosition ?? 0)}
        onChange={handleCameraPositionChange}
      />
    )
  },
)

VideoCameraPositionSwitch.displayName = 'VideoCameraPositionSwitch'

export default VideoCameraPositionSwitch
