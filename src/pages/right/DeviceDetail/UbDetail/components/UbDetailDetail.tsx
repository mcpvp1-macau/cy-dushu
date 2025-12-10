import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import UbInfoCard from './UbInfoCard'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'
import { ComponentRef } from 'react'

const UbDetailDetail: FC = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const productKey = useDeviceDetailStore((s) => s.productKey)

  const modelNumber =
    deviceDetail?.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'

  const videoRef = useRef<ComponentRef<typeof DeviceLiveVideo>>(null)
  const videoId = deviceDetail?.properties.videoList?.[0]?.videoId ?? ''

  const properties = deviceDetail?.properties ?? {}

  const onlineStatus = useRealOnlineStatus(deviceId)

  const longitude = properties.longitude ?? deviceDetail?.longitude
  const latitude = properties.latitude ?? deviceDetail?.latitude
  const heading = properties.heading ?? properties.course
  const speed = properties.speed
  const electricity = properties.batteryPercentage

  return (
    <div className="pb-3">
      <UbInfoCard
        modelNumber={modelNumber}
        onlineStatus={onlineStatus}
        electricity={electricity}
        longitude={longitude}
        latitude={latitude}
        heading={heading}
        speed={speed}
      />
      <div className="m-3">
        <DeviceLiveVideo
          ref={videoRef}
          productKey={productKey}
          deviceId={deviceId}
          videoId={videoId}
          rightTop={
            <VideoSnapshotBtn
              productKey={productKey}
              deviceId={deviceId}
              videoLiveRef={videoRef}
            />
          }
        />
      </div>
    </div>
  )
})

UbDetailDetail.displayName = 'UbDetailDetail'

export default UbDetailDetail
