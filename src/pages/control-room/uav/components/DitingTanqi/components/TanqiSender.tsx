import { Sender } from '@ant-design/x'
import useASR from '../../Tanqi/utils/asr'
import { t } from 'i18next'

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

  const {
    onlineMsg,
    offlineMsg,
    handleStart: handleRecordStart,
    handleStop: handleRecordStop,
  } = useASR(isRecording)

  return (
    <Sender
      placeholder={t('tanqi.sender.placeholder')}
      value={sendValue + offlineMsg + onlineMsg}
      loading={props.loading}
      allowSpeech={{
        recording: isRecording,
        onRecordingChange: (recording) => {
          if (recording === isRecording) {
            return
          }
          if (recording) {
            handleRecordStart()
            setIsRecording(recording)
          } else {
            setTimeout(() => {
              handleRecordStop()
              setIsRecording(recording)
              setSendValue(sendValue + offlineMsg + onlineMsg)
            }, 1000)
          }
        },
      }}
      onChange={setSendValue}
      onSubmit={(message) => {
        props.onSubmit(message)
        setSendValue('')
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
