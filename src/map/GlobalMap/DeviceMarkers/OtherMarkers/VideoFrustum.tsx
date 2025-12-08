import React from 'react'
import Frustum from '../../WaylineEdit/ActionAirline3D/UavPoint/Frustum'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const colorMap = {
  INFRARED_CAMERA: '#9AC4FF',
  VISIBLE_LIGHT_CAMERA: '#9AC4FF', // '#35C2A0',
  THEODOLITE: '#9AC4FF',
}

const farMap = {
  INFRARED_CAMERA: 3000,
  VISIBLE_LIGHT_CAMERA: 3000,
  THEODOLITE: 3000,
}

/** 摄像头可视范围 */
const VideoFrustum: React.FC<PropsType> = ({ data }) => {
  const {
    longitude,
    latitude,
    properties,
    deviceId,
    parentId: _parentId = '34010000006051159000', // TODO 父设备id
    deviceType,
  } = data
  const { videoList, aspectRatio, fov, far } = properties || {}

  const pitch = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[deviceId]?.properties?.pitch / 100,
  )
  const yaw = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[deviceId]?.properties?.yaw / 100,
  )

  const realFov = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[deviceId]?.properties?.fov,
  )

  // videoList长度为空说明不是视频
  if (!videoList?.length) return null
  // TODO 后续这里判断是否子设备
  if (deviceType !== 'THEODOLITE') {
    return null
  }

  console.info(deviceType, pitch, yaw, realFov, fov, far)
  if (!longitude || !latitude) return null
  return (
    <>
      <Frustum
        position={[longitude, latitude, data.altitude || 0]}
        rotation={{
          x: +(pitch ?? 0),
          y: yaw ?? 0,
          z: 0,
        }}
        aspectRatio={aspectRatio}
        color={colorMap[deviceType] || '#35C2A0'}
        fov={realFov ?? fov ?? 30}
        far={far ?? farMap[deviceType] ?? 800}
      />
    </>
  )
}

export default React.memo(VideoFrustum)
