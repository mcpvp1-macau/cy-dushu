import { useRafInterval } from 'ahooks'
import { useRef } from 'react'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

/** 校验自动降落 */
const useCheckAutoland = () => {
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const zSpeed = useUavControlRoomStore((s) => s.uavControlInfo.z) ?? 0
  const height = useUavControlRoomStore((s) => s.state.height) ?? 200
  const clock = useRef(0)
  const lastHeight = useRef(-0x3f)

  const postService = usePostDeviceService(productKey, deviceId)

  useEffect(() => {
    if (zSpeed >= -1) {
      clock.current = 0
      lastHeight.current = -0x3f
    }
  }, [])

  useRafInterval(
    () => {
      if (Math.abs(height - lastHeight.current) < 0.5) {
        clock.current++
      } else {
        clock.current = 0
      }
      if (clock.current >= 3) {
        postService('autoland', {}, '自动降落')
        clock.current = -0x3f
      }
      lastHeight.current = height
      if (clock.current >= 3) {
        clock.current = -0x3f
      }
    },
    zSpeed < -1 ? 1000 : undefined,
  )
}

export default useCheckAutoland
