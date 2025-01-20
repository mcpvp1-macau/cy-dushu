import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import mitt from 'mitt'
import { notification } from 'antd'
import './GlobalMessage.less'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'
type MessageInfoType = {
  id: string
  key?: string
  message: { content: string; [key: string]: any }
  type: 'warning' | 'info' | 'error'
}

type S = {
  messageInfo: MessageInfoType
}

export const messageEmitter = mitt<S>()
const GlobalMessage: React.FC = () => {
  const newEvent = useGlobalWsStore((s) => s.newEvent)
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)
  const nav = useNavigate()

  useEffect(() => {
    if (newEvent) {
      notification.destroy('global-warn')
      const audio = document.getElementById('warnAudio') as HTMLAudioElement
      audio?.play()
      notification.warning({
        message: (
          <span style={{ cursor: 'pointer' }}>
            [{newEvent.deviceName}]{newEvent.eventName}
          </span>
        ), // '新事件',
        // description: `[${newEvent.deviceName}]${newEvent.eventName}`,
        duration: 0,
        placement: 'topRight',
        className: 'global-notification',
        key: 'global-warn',
        onClick: () => {
          notification.destroy('global-warn')
          updateRightMode(RightModeEnum.EVENT_DETAIL)
          updateDetailId(newEvent.eventId)
          // // 退出驾驶舱
          nav('/situation/events')
        },
      })
    }
  }, [newEvent])
  return (
    <audio
      id="warnAudio"
      src={globalConfig.warnAudioUrl || '/images/4611.wav'}
    ></audio>
  )
}

export default GlobalMessage
