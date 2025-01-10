import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'

/**
 * 指点定位
 */
const useDrawVideoPosition = (productKey, deviceId) => {
  const isCameraChangePosition = useWangLouControlRoomStore(
    (s) => s.isCameraChangePosition,
  )

  const uuid = useWangLouControlRoomStore(s => s.uuid)

  const post = usePostDeviceService(productKey, deviceId)

  const onChangePosition = (rect) => {
    post('tapZoomAtTarget', {
      x1: rect[0],
      y1: rect[1],
      x2: rect[2],
      y2: rect[3],
      controlTag: uuid,
    })
  }
  return { enable: isCameraChangePosition?.enabled, onChangePosition }
}

export default useDrawVideoPosition
