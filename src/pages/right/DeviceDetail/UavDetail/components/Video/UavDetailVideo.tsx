import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '../../../hooks/useDeviceDetail.store'
import LinkSwitch from '@/components/LinkSwitch'
import IconButton from '@/components/ui/button/IconButton'
import IconCamera from '@/assets/icons/jsx/IconCamera'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { ComponentRef, lazy } from 'react'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'
import AppViewSuspense from '@/components/AppViewSuspense'

const DeviceLinkSwitch = lazy(
  () => import('@/components/device/DeviceLinkSwitch'),
)

type PropsType = {
  videoSource: string
  videoQuality?: string
  useLinksSwitch?: boolean
}

const UavDetailVideo: FC<PropsType> = memo(
  ({ videoSource, videoQuality, useLinksSwitch }) => {
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
      deviceDetail?.productKey || deviceDetail?.deviceModel?.productKey

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
        // onClickSeiBox={handleSeiClik}
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
