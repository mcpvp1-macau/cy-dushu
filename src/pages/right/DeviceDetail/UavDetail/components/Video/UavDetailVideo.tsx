import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '../../../hooks/useDeviceDetail.store'
import LinkSwitch from '@/components/LinkSwitch'
import IconButton from '@/components/ui/button/IconButton'
import IconCamera from '@/assets/icons/jsx/IconCamera'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { ComponentRef, lazy } from 'react'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'
import AppViewSuspense from '@/components/AppViewSuspense'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import VideoFollow from './VideoFollow'
import VideoProjection from './VideoProjection'
import { isNil } from 'lodash'
import AreaScanSwitch from './AreaScanSwitch'

const DeviceLinkSwitch = lazy(
  () => import('@/components/device/DeviceLinkSwitch'),
)

type PropsType = {
  videoSource: string
  videoQuality?: string
  useLinksSwitch?: boolean
  sn?: string
  /** 是否处于无人机详情中 */
  isInUavDetail?: boolean
}

const UavDetailVideo: FC<PropsType> = memo((props) => {
  const { t } = useTranslation()
  const videoSourceOptions = [
    {
      label: 'FPV',
      value: 'fpv',
    },
    {
      label: t('uav.gimbal.title'),
      value: 'gimbal',
    },
  ]
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
  const deviceId = deviceDetail?.deviceId
  const productKey =
    deviceDetail?.productKey || deviceDetail?.deviceModel!.productKey

  const videoId = deviceDetail?.properties.videoList?.[0]?.videoId ?? ''
  const postService = usePostDeviceService(productKey, deviceId)

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

  // 是否处于跟踪视频状态
  const isFollowing = useMapDevicesStore((s) => !!s.followedVideos[deviceId])
  const activeVideo = useRef<HTMLVideoElement | null>(null)

  //处理视频元素变化
  const handleVideoElementChange = (video: HTMLVideoElement | null) => {
    activeVideo.current = video
    const { projectedVideos } = useMapDevicesStore.getState()
    if (!isNil(projectedVideos[deviceId])) {
      const next = { ...projectedVideos }
      next[deviceId] = {
        ...next[deviceId],
        videoElement: video,
      }
      useMapDevicesStore.setState({
        projectedVideos: next,
      })
    }
  }

  return (
    <DeviceLiveVideo
      ref={videoLiveRef}
      productKey={productKey}
      deviceId={deviceId}
      videoId={videoId}
      sn={props.sn}
      useVideoQualityCheck={{
        open: true,
        valueDRC: props.videoQuality,
        onDRCChange: liveSetQuality,
      }}
      // onClickSeiBox={handleSeiClik}
      renderVideo={!isFollowing}
      onVideoElementChange={handleVideoElementChange}
      leftTop={
        <>
          <LinkSwitch
            items={videoSourceOptions}
            value={props.videoSource}
            onChange={handleVideoSourceChange}
          />
          {props.useLinksSwitch && (
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
          <VideoFollow
            productKey={productKey}
            deviceId={deviceId}
            videoId={videoId}
          />
          {props.isInUavDetail && (
            <>
              <VideoProjection deviceId={deviceId} activeVideo={activeVideo} />
              <AreaScanSwitch deviceId={deviceId} />
            </>
          )}
          <VideoSnapshotBtn
            productKey={productKey}
            deviceId={deviceId}
            videoLiveRef={videoLiveRef}
          />
          <IconButton
            toolTipProps={{ title: t('common.takePhoto') }}
            onClick={handleTakePhoto}
          >
            <IconCamera />
          </IconButton>
        </>
      }
    />
  )
})

UavDetailVideo.displayName = 'UavDetailVideo'

export default UavDetailVideo
