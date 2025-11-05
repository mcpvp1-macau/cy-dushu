import { attempt } from 'lodash'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import CameraVideoProjection from './CameraVideoProjection'
import useCameraSettingStore from '@/store/setting/useCameraSetting.store'

type PropsType = {
  data: API_DEVICE.domain.Device
}

/** 摄像头图标（详情打开的情况） */
const CameraDetailMarker: FC<PropsType> = memo((props) => {
  const { viewer } = useCesium()
  const deviceId = props.data.deviceId

  const projectedVideoEl = useMapDevicesStore(
    (s) => s.projectedVideos[deviceId]?.videoElement,
  )

  const alt =
    useCameraSettingStore((s) => s.deviceCameraConfig[deviceId]?.height) || 0

  useEffect(() => {
    if (!viewer) {
      return
    }

    const device = props.data

    const e = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        device.longitude!,
        device.latitude!,
        alt || device.altitude || 0,
      ),
      id: `device--CAMERA--${device.deviceName}--${device.deviceId}--${device.longitude}--${device.latitude}`,
      billboard: {
        image: '/images/marker/icon/camera.svg',
        width: 24,
        height: 24,
      },
      label: {
        text: device.deviceName,
        font: '12px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, 36),
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(e)
      })
    }
  }, [viewer, alt, props.data])

  return (
    <>
      {projectedVideoEl && (
        <CameraVideoProjection deviceId={deviceId} video={projectedVideoEl} />
      )}
    </>
  )
})

CameraDetailMarker.displayName = 'CameraDetailMarker'

export default CameraDetailMarker
