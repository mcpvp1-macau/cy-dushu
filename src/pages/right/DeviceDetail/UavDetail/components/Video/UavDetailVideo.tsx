import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '../../../hooks/useDeviceDetail.store'
import LinkSwitch from '@/components/LinkSwitch'
import IconButton from '@/components/ui/button/IconButton'
import IconCamera from '@/assets/icons/jsx/IconCamera'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { ComponentRef, lazy } from 'react'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'
import AppViewSuspense from '@/components/AppViewSuspense'
import { AiObject } from '@/components/Video/Jessibuca/sei-types/ai-data'
import useSmarkTrack from '@/hooks/device/useSmarkTrack'

const DeviceLinkSwitch = lazy(
  () => import('@/components/device/DeviceLinkSwitch'),
)

type PropsType = {
  videoSource: string
  videoQuality?: string
  useLinksSwitch?: boolean
}

const videoSourceOptions = [
  {
    label: 'FPV',
    value: 'fpv',
  },
  {
    label: '云台',
    value: 'gimbal',
  },
]

const UavDetailVideo: FC<PropsType> = memo(
  ({ videoSource, videoQuality, useLinksSwitch }) => {
    const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
    const deviceId = deviceDetail?.deviceId
    const productKey =
      deviceDetail?.productKey || deviceDetail?.deviceModel?.productKey

    const videoId = deviceDetail?.properties.videoList?.[0]?.videoId ?? ''
    const postService = usePostDeviceService(productKey, deviceId)

    const { handlePostSmartTrack } = useSmarkTrack(postService)

    const handleVideoSourceChange = useMemoizedFn((v: string) => {
      postService('liveSourcesChange', { videoId, sourceType: v })
    })

    const videoLiveRef = useRef<ComponentRef<typeof DeviceLiveVideo>>(null)

    /** 拍照 */
    const handleTakePhoto = () => {
      postService('takePhoto', {})
    }

    const liveSetQuality = useMemoizedFn((quality: string) => {
      postService('liveSetQuality', { quality })
    })

    const handleSeiClick = useMemoizedFn((e: AiObject) => {
      console.info('e----', e)
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
      });
    })

    return (
      <DeviceLiveVideo
        ref={videoLiveRef}
        productKey={productKey}
        deviceId={deviceId}
        videoId={videoId}
        useVideoQualityCheck={{
          open: true,
          valueDRC: videoQuality,
          onDRCChange: liveSetQuality,
        }}
        onClickSeiBox={handleSeiClick}
        leftTop={
          <>
            <LinkSwitch
              items={videoSourceOptions}
              value={videoSource}
              onChange={handleVideoSourceChange}
            />
            {useLinksSwitch && (
              <AppViewSuspense iconLoading>
                <DeviceLinkSwitch
                  productKey={productKey}
                  deviceId={deviceId}
                  className="text-sm leading-6"
                />
              </AppViewSuspense>
            )}
          </>
        }
        rightTop={
          <>
            <VideoSnapshotBtn
              productKey={productKey}
              deviceId={deviceId}
              videoLiveRef={videoLiveRef}
            />
            <IconButton
              toolTipProps={{ title: '拍照' }}
              onClick={handleTakePhoto}
            >
              <IconCamera />
            </IconButton>
          </>
        }
      />
    )
  },
)

UavDetailVideo.displayName = 'UavDetailVideo'

export default UavDetailVideo
