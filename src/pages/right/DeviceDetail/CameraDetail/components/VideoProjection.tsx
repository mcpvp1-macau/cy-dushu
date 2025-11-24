import IconVideoProjection from '@/assets/icons/jsx/IconVideoProjection'
import IconButton from '@/components/ui/button/IconButton'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'

type PropsType = {}

const CameraVideoProjection: FC<PropsType> = memo(() => {
  const [t] = useTranslation()

  const deviceId = useDeviceDetailStore((s) => s.deviceId)
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

CameraVideoProjection.displayName = 'CameraVideoProjection'

export default CameraVideoProjection
