import { Sender } from '@ant-design/x'
import useASR from '../../Tanqi/utils/asr'

type PropsType = {
  loading?: boolean
  onSubmit: (message: string) => void
  onCancel: () => void
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
    />
  )
})

TanqiSender.displayName = 'TanqiSender'

export default TanqiSender
