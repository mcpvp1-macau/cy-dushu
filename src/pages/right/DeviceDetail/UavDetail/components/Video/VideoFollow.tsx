import IconVideoTrack from '@/assets/icons/jsx/IconVideoTrack'
import IconButton from '@/components/ui/button/IconButton'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = {
  deviceId: string
  productKey: string
  videoId: string
}

/** 视频投射 */
const VideoFollow: FC<PropsType> = memo(({ deviceId, productKey, videoId }) => {
  const { t } = useTranslation()

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
    <IconButton
      className="text-base"
      tippyProps={{ content: t('common.videoFollow') }}
      active={isFollowing}
      onClick={handleFollowVideo}
    >
      <IconVideoTrack />
    </IconButton>
  )
})

VideoFollow.displayName = 'VideoFollow'

export default VideoFollow
