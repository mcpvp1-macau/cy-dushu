import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

const UsvVideo: FC = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)

  const deviceId = deviceDetail?.deviceId
  const productKey =
    deviceDetail?.productKey || deviceDetail?.deviceModel?.productKey
  const videoId = deviceDetail?.properties.videoList?.[0]?.videoId

  if (!deviceId || !productKey || !videoId) {
    return (
      <div className="size-full flex items-center justify-center text-xs text-ground-11">
        {'暂无可用视频流'}
      </div>
    )
  }

  return (
    <div className="size-full bg-black">
      <DeviceLiveVideo
        deviceId={deviceId}
        productKey={productKey}
        videoId={videoId}
        useDing={false}
        useVideoQualityCheck={{ open: true }}
      />
    </div>
  )
})

UsvVideo.displayName = 'UsvVideo'

export default UsvVideo
