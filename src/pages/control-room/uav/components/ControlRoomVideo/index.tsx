import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import LaserRanging from './LaserRanging'
import PositionZoom from './PositionZoom'
import { useSearchParams } from 'react-router-dom'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import useMixARStore from '@/store/control-room/useMixAR.store'
import Avoidance from './components/Avoidance'
import ARScene from './components/ARScene'
import { AiObject } from '@/components/Video/Jessibuca/sei-types/ai-data'
import useSmarkTrack from '@/hooks/device/useSmarkTrack'
import ZoomFocus from './components/ZoomFocus'

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
  const sn = useDeviceDetailStore((s) => s.deviceDetail?.sn)

  const deviceTags = useDeviceDetailStore((s) => s.deviceDetail?.deviceTags)!

  const [searchParams] = useSearchParams()
  const useLW = searchParams.get('useLW')

  const videoQuality = useUavControlRoomStore((s) => s.state.videoQuality)

  const postService = usePostDeviceService(productKey, deviceId)

  const { handlePostSmartTrack } = useSmarkTrack(postService)
  const liveSetQuality = (quality: string) => {
    postService('liveSetQuality', { quality })
  }

  // const enableMixAR = useControlRoomStore((s) => s.state.ar);
  const enableAR = useMixARStore((s) => s.enable)
  const updateUavProperties = useMixARStore((s) => s.updateUavProperties)

  const handlePropertiesSei = (data: any) => {
    updateUavProperties(data)
  }

  /** 是否道通播放器 */
  const isRtcDemo = !!deviceTags?.find(
    (item: any) => item.tagName === 'PLAY_TYPE' && item.tagValue === 'DT_RTC',
  )?.tagValue

  const handleSeiClick = useMemoizedFn((e: AiObject) => {
    const { sourceFrameWidth: fw, sourceFrameHeight: fh, seq } = e
    if (!fw || !fh) return
    let x1 = e.bboxLeft ?? 0
    let y1 = e.bboxLeft ?? 0
    const w = e.bboxWidth
    const h = e.bboxHeight
    if (!x1 && !y1 && !w && !h) return
    const x2 = (x1 + w) / fw
    const y2 = (y1 + h) / fh
    x1 = x1 / fw
    y1 = y1 / fh
    handlePostSmartTrack({
      x1,
      y1,
      x2,
      y2,
      enable: true,
      frame_no: seq,
      object_label: e.objectLabel,
      label_value: e.objLabelList?.[0]?.labelValue,
    })
  })

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
        sn={isRtcDemo ? sn : undefined}
        onUavProperties={handlePropertiesSei}
        onClickSeiBox={handleSeiClick}
        videoChildren={
          <>
            <LaserRanging />
            <ZoomFocus />
            <PositionZoom />
            {/* {enableAR && <MixARCanvas />} */}
            {enableAR && (
              <div className="asolute inset-0">
                <ARScene />
              </div>
            )}
          </>
        }
        videoSafeAreaChildren={<Avoidance />}
      />
    </div>
  )
})

ControlRoomVideo.displayName = 'ControlRoomVideo'

export default ControlRoomVideo
