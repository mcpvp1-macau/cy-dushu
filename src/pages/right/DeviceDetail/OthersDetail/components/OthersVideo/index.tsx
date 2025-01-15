import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'
import { ComponentRef } from 'react'

type PropsType = {
  productKey: string
  deviceId: string
  videoId: string
  videoName: string
}
const WangLouLiveVideo: React.FC<PropsType> = memo((props) => {
  const { productKey, deviceId, videoId, videoName } = props

  const videoRef = useRef<ComponentRef<typeof DeviceLiveVideo>>(null)

  return (
    <>
      <DeviceLiveVideo
        ref={videoRef}
        deviceId={deviceId}
        productKey={productKey!}
        videoId={videoId}
        leftTop={<>{videoName}</>}
        rightTop={
          <VideoSnapshotBtn
            productKey={productKey!}
            deviceId={deviceId}
            videoLiveRef={videoRef}
          />
        }
        // rightBottom={<>123</>}
      />
    </>
  )
})

export default WangLouLiveVideo
