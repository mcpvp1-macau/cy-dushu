import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'
import { ComponentRef } from 'react'

type PropsType = {
  productKey: string
  deviceId: string
  data: API_DEVICE.domain.Device
}
const WangLouLiveVideo: React.FC<PropsType> = memo((props) => {
  const { productKey, deviceId, data } = props

  const videoRef = useRef<ComponentRef<typeof DeviceLiveVideo>>(null)
  const video = data?.videos?.[0]

  return (
    <>
      <DeviceLiveVideo
        ref={videoRef}
        deviceId={deviceId}
        productKey={productKey!}
        videoId={video?.videoId ?? ''}
        leftTop={<>{video?.name}</>}
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
