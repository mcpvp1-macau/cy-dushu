import * as Cesium from 'cesium'
import CameraMarker from './CameraMarker'
import CameraDetailMarker from './CameraDetailMarker'
import DeviceMarkerVideoFollow from '../components/DeviceMarkerVideoFollow'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import useCameraSettingStore from '@/store/setting/useCameraSetting.store'

type PropsType = {
  data: API_DEVICE.domain.Device
  /** 设备图标详情是否打开 */
  isDetail: boolean
  dataSource: Cesium.CustomDataSource
  filterConfig: {
    isOnline: boolean
    isNotTask: boolean
    isTask: boolean
    hiddenDeviceIds: Record<string, boolean>
  }
}

const CameraMarkerWrapper: FC<PropsType> = memo((props) => {
  const followedVideo = useMapDevicesStore(
    (s) => s.followedVideos[props.data.deviceId],
  )
  const alt =
    useCameraSettingStore(
      (s) => s.deviceCameraConfig[props.data.deviceId]?.height,
    ) || 0

  return (
    <>
      {props.isDetail ? (
        <CameraDetailMarker data={props.data} />
      ) : (
        <CameraMarker
          data={props.data}
          dataSource={props.dataSource}
          filterConfig={props.filterConfig}
        />
      )}
      {followedVideo && (
        <DeviceMarkerVideoFollow
          position={[props.data.longitude!, props.data.latitude!, alt]}
          productKey={followedVideo.productKey}
          deviceId={props.data.deviceId}
          videoId={followedVideo.videoId}
        />
      )}
    </>
  )
})

CameraMarkerWrapper.displayName = 'CameraMarkerWrapper'

export default CameraMarkerWrapper
