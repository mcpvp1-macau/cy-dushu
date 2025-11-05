import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { ComponentRef } from 'react'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'
import CameraVideoProjection from './VideoProjection'
import VideoFollow from '../../UavDetail/components/Video/VideoFollow'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = unknown

const CameraDetailVideo: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!

  const deviceId = deviceDetail.deviceId
  const productKey = (deviceDetail.productKey ||
    deviceDetail.deviceModel?.productKey)!
  const videoId = deviceDetail?.properties.videoList?.[0]?.videoId

  const videoRef = useRef<ComponentRef<typeof DeviceLiveVideo>>(null)

  // 是否处于跟踪视频状态
  const isFollowing = useMapDevicesStore((s) => !!s.followedVideos[deviceId])

  return (
    <DeviceLiveVideo
      ref={videoRef}
      deviceId={deviceId}
      productKey={productKey!}
      videoId={videoId ?? ''}
      renderVideo={!isFollowing}
      updateProjectedVideo={!isFollowing}
      rightTop={
        <>
          <VideoFollow
            deviceId={deviceId}
            productKey={productKey!}
            videoId={videoId ?? ''}
          />
          <CameraVideoProjection />
          <VideoSnapshotBtn
            productKey={productKey!}
            deviceId={deviceId}
            videoLiveRef={videoRef}
          />
        </>
      }
    />
  )
})

CameraDetailVideo.displayName = 'CameraDetailVideo'

export default CameraDetailVideo
