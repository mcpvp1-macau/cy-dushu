import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import ControlRoomUGVCameraSwitch from './CameraSwitch'

const ControlRoomUGVVideo: FC = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)

  const deviceId = deviceDetail?.deviceId
  const productKey =
    deviceDetail?.productKey || deviceDetail?.deviceModel?.productKey
  const videoId = deviceDetail?.properties.videoList?.[0]?.videoId
  const sn = deviceDetail?.sn

  if (!deviceId || !productKey || !videoId) {
    return (
      <div className="size-full flex items-center justify-center text-xs text-ground-11">
        {'暂无可用视频流'}
      </div>
    )
  }

  return (
    <div className="relative size-full bg-black">
      <DeviceLiveVideo
        deviceId={deviceId}
        productKey={productKey}
        videoId={videoId}
        sn={sn}
        useDing={false}
        useVideoQualityCheck={{ open: true }}
      />
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3">
        <div className="pointer-events-auto">
          <ControlRoomUGVCameraSwitch />
        </div>
      </div>
    </div>
  )
})

ControlRoomUGVVideo.displayName = 'ControlRoomUGVVideo'

export default ControlRoomUGVVideo
