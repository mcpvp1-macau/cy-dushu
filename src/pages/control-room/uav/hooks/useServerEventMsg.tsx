import { useAppMsg } from '@/hooks/useAppMsg'
import { MessageInstance } from 'antd/es/message/interface'
import { v4 as uuidv4 } from 'uuid'
import { takePhotoEventEmitter } from '../components/ControlRoomVideo/hooks/useHandleTakePhotoEvent'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'
import { autoAIPhotoParamsEmitter } from '../components/AsideButtons/IntelligentPhotograph'
import { playTextToSpeech } from '@/utils/voice/textToSpeech'
import useVoiceSettingStore from '@/store/setting/useVoiceSetting.store'
import { autoAIPhotoParamsPredictEmitter } from '../components/ControlRoomMap/components/AIPhotoPredict/AIPhotoPredict'
import { controlRoomUavEmitter, type TargetAppearanceStatus } from '../events'

/** 处理 Websocket 服务端来的消息弹窗 */
const useServerEventMsg = (msgApi?: MessageInstance) => {
  const appMsgAPI = useAppMsg()
  msgApi ??= appMsgAPI
  const enableVoiceSpeech = useVoiceSettingStore((s) => s.enableVoiceSpeech)

  const handle = useMemoizedFn((wsData) => {
    if (wsData.method === 'event.takePhotoEvent.info') {
      takePhotoEventEmitter.emit('takePhotoEvent', {
        username: wsData.data.username,
        fileId: wsData.data.fileId,
      })
      return
    }
    if (wsData.method === 'event.targetAppearance.info') {
      const info = wsData?.data
      const objectId = info?.objectId
      const status = info?.status as TargetAppearanceStatus | undefined
      if (objectId && (status === 'APPEARANCE' || status === 'LOST')) {
        controlRoomUavEmitter.emit('targetAppearance', {
          objectId,
          status,
        })
      }
      return
    }
    if (wsData.method === 'event.prePhotoEvent.info') {
      autoAIPhotoParamsEmitter.emit('takingRightPhoto', {
        needTakePhoto: wsData.data.method === '1',
      })
    }
    if (wsData.method === 'event.finishAiPhotoPoint.info') {
      autoAIPhotoParamsPredictEmitter.emit('autoAIPhotoParams', null)
    }
    const [c, kind, type] = wsData.method?.split('.') ?? []
    if (c === 'event') {
      if (kind === 'commonEvent' || kind === 'pipelineTaskEvent') {
        // 语音播报
        if (enableVoiceSpeech && wsData.data.voiceNotificationSwitch === 'ON') {
          playTextToSpeech(wsData.data.message)
        }

        // 弹窗通知
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
