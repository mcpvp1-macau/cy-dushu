import * as Cesium from 'cesium'
import { attempt } from 'lodash'

type PropsType = {
  dataSource: Cesium.CustomDataSource
  data: API_DEVICE.domain.Device
  filterConfig: {
    isOnline: boolean
    isNotTask: boolean
    isTask: boolean
    hiddenDeviceIds: Record<string, boolean>
  }
}

/** 摄像头图标（非详情） */
const CameraMarker: FC<PropsType> = memo((props) => {
  useEffect(() => {
    const device = props.data
    // 过滤隐藏设备
    if (props.filterConfig.hiddenDeviceIds[device.deviceId]) {
      return
    }
    // 过滤在线离线
    if (props.filterConfig.isOnline && device.status !== 'ONLINE') {
      return
    }

    const e = props.dataSource.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        device.longitude!,
        device.latitude!,
        device.altitude || 0,
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
        props.dataSource.entities.remove(e)
      })
    }
  }, [props.filterConfig, props.dataSource, props.data])

  return null
})

CameraMarker.displayName = 'CameraMarker'

export default CameraMarker
