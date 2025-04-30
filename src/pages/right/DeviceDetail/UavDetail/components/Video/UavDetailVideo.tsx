import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '../../../hooks/useDeviceDetail.store'
import LinkSwitch from '@/components/LinkSwitch'
import IconButton from '@/components/ui/button/IconButton'
import IconCamera from '@/assets/icons/jsx/IconCamera'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { ComponentRef, lazy } from 'react'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'
import AppViewSuspense from '@/components/AppViewSuspense'
import IconVideoTrack from '@/assets/icons/jsx/IconVideoTrack'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

const DeviceLinkSwitch = lazy(
  () => import('@/components/device/DeviceLinkSwitch'),
)

type PropsType = {
  videoSource: string
  videoQuality?: string
  useLinksSwitch?: boolean
  sn?: string
}

const UavDetailVideo: FC<PropsType> = memo(
  ({ videoSource, videoQuality, sn, useLinksSwitch }) => {
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

    const handleFollowVideo = () => {
      const followedVideos = useMapDevicesStore.getState().followedVideos
      const nextFollowedVideos = { ...followedVideos }
      if (isFollowing) {
        delete nextFollowedVideos[deviceId]
      } else {
        nextFollowedVideos[deviceId] = {
          productKey,
          videoId,
        }
      }
      useMapDevicesStore.setState({
        followedVideos: nextFollowedVideos,
      })
    }

    return (
      <DeviceLiveVideo
        ref={videoLiveRef}
        productKey={productKey}
        deviceId={deviceId}
        videoId={videoId}
        sn={sn}
        useVideoQualityCheck={{
          open: true,
          valueDRC: videoQuality,
          onDRCChange: liveSetQuality,
        }}
        // onClickSeiBox={handleSeiClik}
        renderVideo={!isFollowing}
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
            <IconButton
              className="text-base"
              toolTipProps={{
                title: t('common.videoFollow'),
              }}
              active={isFollowing}
              onClick={handleFollowVideo}
            >
              <IconVideoTrack />
            </IconButton>
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
  },
)

UavDetailVideo.displayName = 'UavDetailVideo'

export default UavDetailVideo
