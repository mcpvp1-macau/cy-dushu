import { useDeviceDetailStore } from './useDeviceDetail.store'
import { usePostDeviceService as _usePostDeviceService } from '@/hooks/device/usePostDeviceService'

/** 获取设备服务调用 */
const usePostDeviceService = () => {
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const postService = _usePostDeviceService(productKey, deviceId)

  return postService
}

export default usePostDeviceService
