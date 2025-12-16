import { useMemoizedFn } from 'ahooks'
import dayjs from 'dayjs'
import { msgEmitter } from '@/pages/control-room/uav/components/Tanqi'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { shouldJson } from '@/utils/json'
import { deviceRelayEmitter } from '../DeviceRelay'

export const useActionWsHandlers = () => {
  const updateNewLog = useGlobalWsStore((s) => s.updateNewLog)
  const handleActionLog = useMemoizedFn((message: any) => {
    updateNewLog(message)
  })

  const updateRefreshTemporary = useGlobalWsStore((s) => s.updateRefreshTemporary)
  const handleTemporaryDetectResult = useMemoizedFn((message: any) => {
    updateRefreshTemporary({ ...message, time: dayjs().valueOf() })
  })

  const updateActionItemStatus = useGlobalWsStore((s) => s.updateActionItemStatus)
  const handleActionItemStatus = useMemoizedFn((message: any) => {
    const data = shouldJson<any[]>(message)
    if (!data) {
      return
    }
    const res = data.reduce<Record<string, any>>((prev, e) => {
      if (e.deviceId) {
        prev[e.deviceId] = {
          actionItemId: e.actionItemId,
          status: e.status,
        }
      }
      return prev
    }, {})
    updateActionItemStatus(res)
  })

  const handleDialogResponse = useMemoizedFn((message: any) => {
    msgEmitter.emit('message', message)
  })

  const handleRelayEvent = useMemoizedFn(
    (message: { breakPointId: number; actionId: number; deviceId: string }) => {
      deviceRelayEmitter.emit('notify', message)
    },
  )

  return {
    handleActionItemStatus,
    handleActionLog,
    handleDialogResponse,
    handleRelayEvent,
    handleTemporaryDetectResult,
  }
}
