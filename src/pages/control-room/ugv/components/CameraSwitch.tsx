import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUGVControlRoomStore } from '@/store/context-store/useUGVControlRoom.store'

const ControlRoomUGVCameraSwitch: FC = memo(() => {
  const videoSource = useUGVControlRoomStore((s) => s.state.videoSource)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const videoId = useDeviceDetailStore(
    (s) => s.deviceDetail?.properties.videoList?.[0]?.videoId,
  )
  const postDeviceService = usePostDeviceService(productKey, deviceId)

  const handleVideoSourceChange = useMemoizedFn((sourceType: string) => {
    postDeviceService('liveSourcesChange', { videoId, sourceType })
  })

  return (
    <div className="flex gap-2">
      <FloatIconButton
        active={videoSource === 'front'}
        className="size-8 text-xs uppercase tracking-wide"
        onClick={() => handleVideoSourceChange('front')}
      >
        前视
      </FloatIconButton>
      <FloatIconButton
        active={videoSource === 'back'}
        className="size-8 text-xs uppercase tracking-wide"
        onClick={() => handleVideoSourceChange('back')}
      >
        后视
      </FloatIconButton>
    </div>
  )
})

ControlRoomUGVCameraSwitch.displayName = 'ControlRoomUGVCameraSwitch'

export default ControlRoomUGVCameraSwitch
