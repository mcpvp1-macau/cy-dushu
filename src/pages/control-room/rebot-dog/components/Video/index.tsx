import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

const RebotDogVideo: FC<unknown> = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceDetail?.deviceId)!
  const productKey = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )!
  const videoId = useDeviceDetailStore(
    (s) => s.deviceDetail?.properties.videoList?.[0]?.videoId,
  )!

  return (
    <div className="absolute inset-0  bg-black">
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

RebotDogVideo.displayName = 'RebotDogVideo'

export default RebotDogVideo
