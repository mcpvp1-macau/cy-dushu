import { useAppMsg } from '@/hooks/useAppMsg'
import { MessageInstance } from 'antd/es/message/interface'
import { v4 as uuidv4 } from 'uuid'
import { takePhotoEventEmitter } from '../components/ControlRoomVideo/hooks/useHandleTakePhotoEvent'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'

/** 处理 Websocket 服务端来的消息弹窗 */
const useServerEventMsg = (msgApi?: MessageInstance) => {
  const appMsgAPI = useAppMsg()
  msgApi ??= appMsgAPI
  const handle = useMemoizedFn((wsData) => {
    if (wsData.method === 'event.takePhotoEvent.info') {
      takePhotoEventEmitter.emit('takePhotoEvent', {
        username: wsData.data.username,
        fileId: wsData.data.fileId,
      })
      return
    }
    const [c, kind, type] = wsData.method?.split('.') ?? []
    if (c === 'event') {
      if (kind === 'commonEvent' || kind === 'pipelineTaskEvent') {
        const id = uuidv4()
        msgApi.open({
          key: id,
          type,
          content: wsData.data.needConfirm ? (
            <div className="flex items-center gap-1">
              <p>{wsData.data.message}</p>
              <IconButton
                className="text-lg"
                onClick={() => msgApi.destroy(id)}
              >
                <IconClose />
              </IconButton>
            </div>
          ) : (
            wsData.data.message
          ),
          duration: wsData.data.needConfirm ? 0 : 3,
        })
      }
    }
  })
  return handle
}

export default useServerEventMsg
