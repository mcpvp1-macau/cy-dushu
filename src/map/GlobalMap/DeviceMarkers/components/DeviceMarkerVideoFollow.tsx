import IconClose from '@/assets/icons/jsx/IconClose'
import BoardMarker3D from '@/components/map/BoardCesium/BoardMarker3D'
import IconButton from '@/components/ui/button/IconButton'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useCesium } from 'resium'

type PropsType = {
  position: number[]
  productKey: string
  deviceId: string
  videoId: string
}

const DeviceMarkerVideoFollow: FC<PropsType> = memo((props) => {
  const { viewer } = useCesium()

  if (!viewer) {
    return null
  }

  return (
    <BoardMarker3D
      id={`video-${props.deviceId}`}
      lng={props.position[0]}
      lat={props.position[1]}
      height={props.position[2] ?? 0}
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
            delete next[props.deviceId]
            useMapDevicesStore.setState({
              followedVideos: next,
            })
          }}
        >
          <IconClose />
        </IconButton>
        <DeviceLiveVideo
          deviceId={props.deviceId}
          productKey={props.productKey}
          videoId={props.videoId}
          useTopBar={false}
          updateProjectedVideo={true}
        />
      </div>
    </BoardMarker3D>
  )
})

DeviceMarkerVideoFollow.displayName = 'DeviceMarkerVideoFollow'

export default DeviceMarkerVideoFollow
