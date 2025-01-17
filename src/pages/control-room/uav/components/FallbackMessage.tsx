import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import { Popover } from 'antd'
import { memo, type FC } from 'react'

type PropsType = unknown

/** state 回馈消息展示 */
const FallbackMessage: FC<PropsType> = memo(() => {
  const healthInfo = useUavControlRoomStore((s) => s.state.healthInfo)
  const displayMode = useUavControlRoomStore((s) => s.state.displayMode)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const onlineStatus = useRealOnlineStatus(deviceId)
  const isONLINE = onlineStatus === 'ONLINE'
  const wsReadyState = useUavControlRoomStore((s) => s.wsReadyState)

  const { t } = useTranslation()

  const formatMsg = useMemoizedFn((msg: string) => {
    let info = '',
      color: string | undefined = undefined
    if (!msg) {
      return { info, color }
    }
    if (!isONLINE) {
      info = t('controlRoom.uav.healthInfo.offline')
      color = '#DD4444'
    }
    let i = msg.indexOf('Error')
    if (i >= 0) {
      info = msg.slice(i + 5)
      color = '#DD4444'
    } else if ((i = msg.indexOf('Warn')) >= 0) {
      info = msg.slice(i + 4)
      color = '#F29D49'
    } else if ((i = msg.indexOf('Info')) >= 0) {
      info = msg.slice(i + 4)
      color = '#262e36'
    }
    return { info, color }
  })

  const renderMsgs = useMemo(() => {
    if (!Array.isArray(healthInfo)) {
      return []
    }
    return healthInfo.map((msg, i) => {
      const { info, color } = formatMsg(msg)
      return (
        <p
          key={i}
          className="px-2 py-1 text-white text-sm rounded-[3px] truncate"
          style={{ backgroundColor: color }}
        >
          {info}
        </p>
      )
    })
  }, [healthInfo])

  const mode = useMemo(() => {
    if (wsReadyState !== WebSocket.OPEN) {
      return t('common.connectionLost')
    }
    if (!isONLINE) {
      return t('device.status.online.OFFLINE')
    }
    if (!displayMode) {
      return ''
    }
    const isFly = (displayMode as string).includes?.('指点飞行')
    return isFly ? '指点飞行' : displayMode
  }, [wsReadyState, isONLINE, displayMode])

  return (
    <>
      {renderMsgs.length > 0 && (
        <>
          <Popover
            content={<div className="flex flex-col gap-1">{renderMsgs}</div>}
            placement="bottomLeft"
          >
            <div className="flex gap-3">
              <div className="px-2 py-1 text-white text-sm rounded-[3px] bg-ground-2">
                {renderMsgs.length}
              </div>
              <div className="max-w-64">{renderMsgs[0]}</div>
            </div>
          </Popover>
        </>
      )}
      {mode && (
        <div className="text-sm px-2 py-1 bg-ground-3 bg-opacity-80 rounded-[3px]">
          {mode}
        </div>
      )}
    </>
  )
})

FallbackMessage.displayName = 'FallbackMessage'

export default FallbackMessage
