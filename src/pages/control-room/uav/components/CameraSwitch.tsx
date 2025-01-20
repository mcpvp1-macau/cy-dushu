import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'

type PropsType = unknown

const ControlRoomUavCameraSwitch: FC<PropsType> = memo(() => {
  const videoSource = useUavControlRoomStore((s) => s.state.videoSource)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const videoId = useDeviceDetailStore(
    (s) => s.deviceDetail?.properties.videoList?.[0]?.videoId,
  )
  const postDeviceService = usePostDeviceService(productKey, deviceId)

  const handleVideoSourceChange = useMemoizedFn((v: string) => {
    postDeviceService('liveSourcesChange', { videoId, sourceType: v })
  })

  const { t } = useTranslation()

  return (
    <div className="flex gap-2">
      <FloatIconButton
        active={videoSource === 'fpv'}
        className="text-xs h-7 leading-7 font-bold"
        onClick={() => handleVideoSourceChange('fpv')}
      >
        FPV
      </FloatIconButton>
      <FloatIconButton
        active={videoSource === 'gimbal'}
        className="text-xs h-7 leading-7 font-bold"
        onClick={() => handleVideoSourceChange('gimbal')}
      >
        {t('controlRoom.uav.btn.gimbal.title')}
      </FloatIconButton>
    </div>
  )
})

ControlRoomUavCameraSwitch.displayName = 'ControlRoomUavCameraSwitch'

export default ControlRoomUavCameraSwitch
