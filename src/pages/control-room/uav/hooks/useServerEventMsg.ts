import { useAppMsg } from '@/hooks/useAppMsg'
import { MessageInstance } from 'antd/es/message/interface'
import { v4 as uuidv4 } from 'uuid'

/** 处理 Websocket 服务端来的消息弹窗 */
const useServerEventMsg = (msgApi?: MessageInstance) => {
  const appMsgAPI = useAppMsg()
  msgApi ??= appMsgAPI
  const handle = useMemoizedFn((wsData) => {
    const [c, kind, type] = wsData.method?.split('.') ?? []
    if (c === 'event') {
      if (kind === 'commonEvent' || kind === 'pipelineTaskEvent') {
        msgApi.open({
          key: uuidv4(),
          type,
          content: wsData.data.message,
          duration: wsData.data.needConfirm ? 0 : 3,
        })
      }
    }
  })
  return handle
}

export default useServerEventMsg
