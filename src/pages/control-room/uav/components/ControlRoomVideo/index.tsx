import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import LaserRanging from './LaserRanging'
import PositionZoom from './PositionZoom'
import { useSearchParams } from 'react-router-dom'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import useMixARStore from '@/store/control-room/useMixAR.store'
import MixARCanvas from './MixARCanvas'

type PropsType = {
  onAspectRatioChange?: (aspectRatio: number) => void
}

const ControlRoomVideo: FC<PropsType> = memo(({ onAspectRatioChange }) => {
  const deviceId = useDeviceDetailStore((s) => s.deviceDetail?.deviceId)!
  const productKey = useDeviceDetailStore(
    (s) => s.deviceDetail?.productKey || s.deviceDetail?.deviceModel.productKey,
  )
  const videoId = useDeviceDetailStore(
    (s) => s.deviceDetail?.properties.videoList?.[0]?.videoId,
  )!

  const [searchParams] = useSearchParams()
  const useLW = searchParams.get('useLW')

  const videoQuality = useUavControlRoomStore((s) => s.state.videoQuality)

  const postService = usePostDeviceService(productKey, deviceId)
  const liveSetQuality = (quality: string) => {
    postService('liveSetQuality', { quality })
  }

  // const enableMixAR = useControlRoomStore((s) => s.state.ar);
  const enableAR = useMixARStore((s) => s.enable)
  const updateUavProperties = useMixARStore((s) => s.updateUavProperties)

  const handlePropertiesSei = (data: any) => {
    updateUavProperties(data)
  }

  return (
    <div className="absolute inset-0  bg-black">
      <DeviceLiveVideo
        deviceId={deviceId}
        productKey={productKey}
        videoId={videoId}
        useDing={false}
        useVideoQualityCheck={{
          open: true,
          valueDRC: videoQuality ?? (useLW ? 'Unknown' : undefined),
          onDRCChange: liveSetQuality,
        }}
        onAspectRatioChange={(v) => {
          // setAspectRatio(v)
          onAspectRatioChange?.(v)
        }}
        onUavProperties={handlePropertiesSei}
        videoChildren={
          <>
            <LaserRanging />
            <PositionZoom />
            {enableAR && <MixARCanvas />}
          </>
        }
      />
    </div>
  )
})

ControlRoomVideo.displayName = 'ControlRoomVideo'

export default ControlRoomVideo
