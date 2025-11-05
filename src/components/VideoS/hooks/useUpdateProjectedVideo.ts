import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { isNil } from 'lodash'

/** 更新视频投影中的视频 */
const useUpdateProjectedVideo = (deviceId: string, needUpdate: boolean) => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null)

  const handleVideoElementChange = (video: HTMLVideoElement | null) => {
    videoElementRef.current = video
    if (needUpdate) {
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
  }

  const openProjected = useMapDevicesStore((s) => !!s.projectedVideos[deviceId])
  useEffect(() => {
    if (openProjected && needUpdate && videoElementRef.current) {
      const { projectedVideos } = useMapDevicesStore.getState()
      if (!isNil(projectedVideos[deviceId])) {
        const next = { ...projectedVideos }
        next[deviceId] = {
          ...next[deviceId],
          videoElement: videoElementRef.current,
        }
        useMapDevicesStore.setState({
          projectedVideos: next,
        })
      }
    }
  }, [openProjected, needUpdate, deviceId])

  return handleVideoElementChange
}

export default useUpdateProjectedVideo
