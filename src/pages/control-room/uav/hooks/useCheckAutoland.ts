import { useRafInterval } from 'ahooks'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import usePostDeviceService from './usePostDeviceService'

/** 校验自动降落 */
const useCheckAutoland = () => {
  const postService = usePostDeviceService()
  const zSpeed = useUavControlRoomStore((s) => s.uavControlInfo.z) ?? 0
  const height = useUavControlRoomStore((s) => s.state.height) ?? 200
  const clock = useRef(0)
  const lastHeight = useRef(-0x3f)

  const { t } = useTranslation()

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
        postService('autoland', {}, t('controlRoom.uav.service.autoland.title'))
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
