import useMapDevicesStore from '@/store/map/useMapDevices.store'
import UavDetailMarker from './UavDetailMarker'
import UavMarker from './UavMarker'
import { useCesium } from 'resium'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import BoardMarker3D from '@/components/map/BoardCesium/BoardMarker3D'
import { isNil } from 'lodash'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'

type PropsType = {
  data: API_DEVICE.domain.Device
  isDetail: boolean
}

const UavMarkerWrapper: FC<PropsType> = memo(({ data, isDetail }) => {
  const { deviceId } = data
  const followedVideo = useMapDevicesStore(
    (s) => s.followedVideos[data.deviceId],
  )
  const { viewer } = useCesium()

  const [position, setPosition] = useState({
    longitude: data.longitude,
    latitude: data.latitude,
    altitude: data.altitude,
  })

  const videoElementRef = useRef<HTMLVideoElement | null>(null)
  if (!followedVideo) {
    videoElementRef.current = null
  }

  const projectVideo = useMapDevicesStore((s) => s.projectedVideos[deviceId])
  useEffect(() => {
    if (projectVideo && videoElementRef.current) {
      const next = { ...useMapDevicesStore.getState().projectedVideos }
      next[deviceId] = {
        ...next[deviceId],
        videoElement: videoElementRef.current,
      }
      useMapDevicesStore.setState({
        projectedVideos: next,
      })
    }
  }, [!!projectVideo])

  return (
    <>
      {isDetail ? (
        <UavDetailMarker
          deviceId={data.deviceId}
          onPositionChange={setPosition}
        />
      ) : (
        <UavMarker data={data} onPositionChange={setPosition} />
      )}
      {followedVideo && viewer && (
        <BoardMarker3D
          id={`video-${deviceId}`}
          lng={position.longitude}
          lat={position.latitude}
          height={position.altitude ?? 0}
          map={viewer}
          option={{
            verticalPosition: 'center',
            horizontalPosition: 'center',
          }}
        >
          <div className="w-[300px] relative">
            <IconButton
              className="absolute top-1 right-1 z-10 bg-black/40 text-base size-5 flex items-center justify-center rounded-full"
              onClick={() => {
                const next = {
                  ...useMapDevicesStore.getState().followedVideos,
                }
                delete next[deviceId]
                useMapDevicesStore.setState({
                  followedVideos: next,
                })
              }}
            >
              <IconClose />
            </IconButton>
            <DeviceLiveVideo
              deviceId={deviceId}
              productKey={followedVideo.productKey}
              videoId={followedVideo.videoId}
              useTopBar={false}
              onVideoElementChange={(video: HTMLVideoElement | null) => {
                const { projectedVideos } = useMapDevicesStore.getState()
                videoElementRef.current = video
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
              }}
            />
          </div>
        </BoardMarker3D>
      )}
    </>
  )
})

UavMarkerWrapper.displayName = 'UavMarkerWrapper'

export default UavMarkerWrapper
