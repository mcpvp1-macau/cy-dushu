import { Sender } from '@ant-design/x'
import { t } from 'i18next'
import useTranscribeAudio from '../../pages/control-room/uav/components/DitingTanqi/hooks/useTranscribeAudio'

type PropsType = {
  loading?: boolean
  onSubmit: (message: string) => void
  onCancel: () => void
  foolter?: React.ReactNode
}

/** 檀棋会话发送器 */
const TanqiSender: FC<PropsType> = memo((props) => {
  const [sendValue, setSendValue] = useState('')

  // 是否在语音录制识别
  const [isRecording, setIsRecording] = useState(false)

  const { translating, voiceText, clearVoiceText } = useTranscribeAudio(
    isRecording,
    2000,
  )

  return (
    <Sender
      placeholder={t('tanqi.sender.placeholder')}
      value={sendValue + voiceText}
      loading={props.loading}
      allowSpeech={{
        recording: isRecording || translating,
        onRecordingChange: (recording) => {
          if (recording === isRecording) {
            return
          }
          if (recording !== isRecording) {
            setIsRecording(recording)
          }
        },
      }}
      onChange={(value) => {
        setSendValue(value)
        clearVoiceText()
      }}
      onSubmit={(message) => {
        props.onSubmit(message)
        setSendValue('')
        clearVoiceText()
      }}
      onCancel={props.onCancel}
      actions={false}
      footer={({ components }) => {
        const { SendButton, LoadingButton, SpeechButton } = components
        return (
          <div className="flex justify-between items-end px-3 pb-3">
            <div>{props.foolter}</div>
            <div className="flex gap-1">
              <SpeechButton />
              {props.loading ? (
                <LoadingButton type="default" />
              ) : (
                <SendButton type="primary" />
              )}
            </div>
          </div>
        )
      }}
    />
  )
})

TanqiSender.displayName = 'TanqiSender'

export default TanqiSender
