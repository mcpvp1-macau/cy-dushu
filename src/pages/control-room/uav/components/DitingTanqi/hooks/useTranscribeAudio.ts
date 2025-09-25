import { transcribeAudio } from '@/service/modules/voice'

/** 语音识别 */
const useTranscribeAudio = (
  isRecording: boolean,
  timeslice?: number | undefined,
) => {
  const mediaStream = useRef<MediaStream | null>(null)
  const [voiceText, setVoiceText] = useState('')
  const [translating, setTranslating] = useState(false)

  const startRecording = async () => {
    mediaStream.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })
    if (!mediaStream.current) {
      return
    }

    const mediaRecorder = new MediaRecorder(mediaStream.current)

    const chunks: Blob[] = []
    const stopControllers: Set<AbortController> = new Set<AbortController>()

    mediaRecorder.ondataavailable = async (evt) => {
      // 取消之前的请求
      for (const controller of stopControllers) {
        controller.abort()
      }
      stopControllers.clear()

      chunks.push(evt.data)
      const file = new File(chunks, 'a.webm', {
        type: 'audio/webm',
      })
      const controller = new AbortController()
      stopControllers.add(controller)
      try {
        setTranslating(true)
        const resp = await transcribeAudio(file, controller.signal)
        setVoiceText(resp.text)
      } finally {
        // 如果删除成功, 说明是正常结束的
        if (stopControllers.delete(controller)) {
          setTranslating(false)
        }
      }
    }

    mediaRecorder.start(timeslice)
  }

  useEffect(() => {
    if (isRecording) {
      startRecording()
    } else if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop())
      mediaStream.current = null
    }
  }, [isRecording])

  const clearVoiceText = () => {
    setVoiceText('')
  }

  return { translating, voiceText, clearVoiceText }
}

export default useTranscribeAudio
