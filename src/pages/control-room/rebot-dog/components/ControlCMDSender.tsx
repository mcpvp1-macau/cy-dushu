import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { useRafInterval } from 'ahooks'

type PropsType = unknown

/** 负责输出(机器狗)控制命令 */
const ControlCMDSender: FC<PropsType> = memo(() => {
  const dogControlInfo = useRebotDogControlRoomStore((s) => s.dogControlInfo)
  const activeMouseBtn = useRebotDogControlRoomStore((s) => s.activeMouseBtn)
  const post = useRebotDogControlRoomStore((s) => s.sendCommand)

  // 无人机控制信息
  const dogPostInfo = useMemo(() => {
    let newVal: Record<string, number> = {}
    let hasValue = false
    for (const [k, v] of Object.entries(dogControlInfo)) {
      if (Math.abs(v ?? 0) < 1e-4) {
        continue
      }
      newVal[k] = v
      hasValue = true
    }
    if (activeMouseBtn && activeMouseBtn.method === 'service.moveDog.post') {
      newVal = {
        ...newVal,
        ...activeMouseBtn.value,
      }
      hasValue = true
    }
    return hasValue ? newVal : undefined
  }, [dogControlInfo, activeMouseBtn])

  // 无人机控制发送
  useRafInterval(() => {
    post('service.moveDog.post', dogPostInfo)
  }, dogPostInfo && 50)

  return null
})

ControlCMDSender.displayName = 'ControlCMDSender'

export default ControlCMDSender
