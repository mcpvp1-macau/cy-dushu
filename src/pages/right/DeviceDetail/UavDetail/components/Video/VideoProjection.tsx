import IconVideoProjection from '@/assets/icons/jsx/IconVideoProjection'
import IconButton from '@/components/ui/button/IconButton'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import useMapSettingStore from '@/store/setting/useMapSetting.store'
import { RefObject } from 'react'

type PropsType = {
  deviceId: string
  activeVideo: RefObject<HTMLVideoElement | null>
}

/** 视频投射 */
const VideoProjection: FC<PropsType> = memo(({ deviceId, activeVideo }) => {
  const { t } = useTranslation()

  const isProjecting = useMapDevicesStore((s) => !!s.projectedVideos[deviceId])

  const handleClick = () => {
    const projectedVideos = useMapDevicesStore.getState().projectedVideos
    const next = { ...projectedVideos }
    if (isProjecting) {
      delete next[deviceId]
    } else {
      next[deviceId] = {
        videoElement: activeVideo.current,
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
      toolTipProps={{ title: t('common.videoProjection') }}
      active={isProjecting}
      onClick={handleClick}
    >
      <IconVideoProjection />
    </IconButton>
  )
})

VideoProjection.displayName = 'VideoProjection'

export default VideoProjection
