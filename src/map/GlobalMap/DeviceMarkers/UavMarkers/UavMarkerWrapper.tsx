import useMapDevicesStore from '@/store/map/useMapDevices.store'
import UavDetailMarker from './UavDetailMarker'
import UavMarker from './UavMarker'
import { useCesium } from 'resium'
import DeviceMarkerVideoFollow from '../components/DeviceMarkerVideoFollow'

type PropsType = {
  data: API_DEVICE.domain.Device
  isDetail: boolean
}

const UavMarkerWrapper: FC<PropsType> = memo(({ data, isDetail }) => {
  const { deviceId } = data

  const { viewer } = useCesium()

  const [position, setPosition] = useState({
    longitude: data.longitude,
    latitude: data.latitude,
    altitude: data.altitude,
  })

  const followedVideo = useMapDevicesStore(
    (s) => s.followedVideos[data.deviceId],
  )

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
      {followedVideo &&
        viewer &&
        position.longitude &&
        position.latitude &&
        position.altitude && (
          <DeviceMarkerVideoFollow
            position={[
              position.longitude,
              position.latitude,
              position.altitude,
            ]}
            productKey={followedVideo.productKey}
            deviceId={deviceId}
            videoId={followedVideo.videoId}
          />
        )}
    </>
  )
})

UavMarkerWrapper.displayName = 'UavMarkerWrapper'

export default UavMarkerWrapper
