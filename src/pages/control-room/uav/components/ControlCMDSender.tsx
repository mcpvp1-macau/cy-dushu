import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useRafInterval } from 'ahooks'
import { memo, useMemo, type FC } from 'react'
// import useCheckAutoland from '../hooks/useCheckAutoland'

type PropsType = unknown

/** 负责输出(无人机/云台)控制命令 */
const ControlCMDSender: FC<PropsType> = memo(() => {
  const uavControlInfo = useUavControlRoomStore((s) => s.uavControlInfo)
  const gimbalControlInfo = useUavControlRoomStore((s) => s.gimbalControlInfo)
  const activeMouseBtn = useUavControlRoomStore((s) => s.activeMouseBtn)
  const post = useUavControlRoomStore((s) => s.sendCommand)

  // useCheckAutoland()

  // 无人机控制信息
  const uavPostInfo = useMemo(() => {
    let newVal: Record<string, number> = {}
    let hasValue = false
    for (const [k, v] of Object.entries(uavControlInfo)) {
      if (Math.abs(v ?? 0) < 1e-4) {
        continue
      }
      newVal[k] = v
      hasValue = true
    }
    if (activeMouseBtn && activeMouseBtn.method === 'service.moveUav.post') {
      newVal = {
        ...newVal,
        ...activeMouseBtn.value,
      }
      hasValue = true
    }
    // 斜飞速度限制
    if ('x' in newVal && 'y' in newVal) {
      const x2 = newVal.x ** 2
      const y2 = newVal.y ** 2
      const s = Math.min(x2 + y2, 15 ** 2)
      newVal.x = Math.sign(newVal.x) * Math.sqrt((s * x2) / (x2 + y2))
      newVal.y = Math.sign(newVal.y) * Math.sqrt((s * y2) / (x2 + y2))
    }
    return hasValue ? newVal : undefined
  }, [uavControlInfo, activeMouseBtn])

  // 云台控制信息
  const gimbalPostInfo = useMemo(() => {
    let newVal: Record<string, number> = {}
    let hasValue = false
    for (const [k, v] of Object.entries(gimbalControlInfo)) {
      if (Math.abs(v ?? 0) < 1e-4) {
        continue
      }
      newVal[k] = v
      hasValue = true
    }
    if (activeMouseBtn && activeMouseBtn.method === 'service.moveGimbal.post') {
      newVal = {
        ...newVal,
        ...activeMouseBtn.value,
      }
      hasValue = true
    }
    return hasValue ? newVal : undefined
  }, [gimbalControlInfo, activeMouseBtn])

  // 无人机控制发送
  useRafInterval(() => {
    post('service.moveUav.post', uavPostInfo)
  }, uavPostInfo && 50)

  // 云台控制发送
  useRafInterval(() => {
    post('service.moveGimbal.post', gimbalPostInfo)
  }, gimbalPostInfo && 50)

  return null
})

ControlCMDSender.displayName = 'ControlCMDSender'

export default ControlCMDSender
