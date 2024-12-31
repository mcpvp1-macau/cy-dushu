import { ComponentRef, memo, type FC } from 'react'
import CameraDetailInfoCard from './CameraDetailInfoCard'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'

type PropsType = unknown

const CameraDetailDetail: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!

  const deviceId = deviceDetail.deviceId
  const productKey = (deviceDetail.productKey ||
    deviceDetail.deviceModel?.productKey)!
  const videoId = deviceDetail?.properties.videoList?.[0]?.videoId

  const modelName =
    deviceDetail.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'

  const videoRef = useRef<ComponentRef<typeof DeviceLiveVideo>>(null)

  return (
    <div>
      <section className="mx-3">
        <CameraDetailInfoCard
          modelNumber={modelName}
          onlineStatus={deviceDetail.status}
          longitude={deviceDetail.longitude}
          latitude={deviceDetail.latitude}
        />
      </section>
      <section className="mx-3 my-3">
        <DeviceLiveVideo
          ref={videoRef}
          deviceId={deviceId}
          productKey={productKey}
          videoId={videoId ?? ''}
          rightTop={
            <VideoSnapshotBtn
              productKey={productKey}
              deviceId={deviceId}
              videoLiveRef={videoRef}
            />
          }
        />
      </section>
    </div>
  )
})

CameraDetailDetail.displayName = 'CameraDetailDetail'

export default CameraDetailDetail
