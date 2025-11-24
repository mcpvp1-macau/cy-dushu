import IconVideoProjection from '@/assets/icons/jsx/IconVideoProjection'
import IconButton from '@/components/ui/button/IconButton'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import useMapSettingStore from '@/store/setting/useMapSetting.store'

type PropsType = {
  deviceId: string
}

/** 视频投射 */
const VideoProjection: FC<PropsType> = memo(({ deviceId }) => {
  const { t } = useTranslation()

  const isProjecting = useMapDevicesStore((s) => !!s.projectedVideos[deviceId])

  const handleClick = () => {
    const projectedVideos = useMapDevicesStore.getState().projectedVideos
    const next = { ...projectedVideos }
    if (isProjecting) {
      delete next[deviceId]
    } else {
      next[deviceId] = {
        videoElement: null,
      }

      // 确保打开无人机视椎体
      if (!useMapSettingStore.getState().uavDetailFrustum) {
        useMapSettingStore.getState().updateUavDetailFrustum(true)
      }
    }
    useMapDevicesStore.setState({
      projectedVideos: next,
    })
  }

  return (
    <IconButton
      tippyProps={{ content: t('common.videoProjection') }}
      active={isProjecting}
      onClick={handleClick}
    >
      <IconVideoProjection />
    </IconButton>
  )
})

VideoProjection.displayName = 'VideoProjection'

export default VideoProjection
