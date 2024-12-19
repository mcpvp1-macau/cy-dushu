import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { usePostDeviceService as _usePostDeviceService } from '@/hooks/device/usePostDeviceService'

/** 获取无人机驾驶舱设备服务调用 */
const usePostDeviceService = () => {
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const postService = _usePostDeviceService(productKey, deviceId)

  return postService
}

export default usePostDeviceService
