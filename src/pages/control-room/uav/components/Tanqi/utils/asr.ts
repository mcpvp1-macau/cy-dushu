import useWebSocket from 'react-use-websocket'
import Recorder from 'recorder-core'
import 'recorder-core/src/engine/pcm.js'

const useASR = (recording: boolean) => {
  const isRec = useRef(false)
  const sampleBuf = useRef(new Int16Array())

  const url = recording ? '/asr' : null
  const [onlineMsg, setOnlineMsg] = useState('')
  const [offlineMsg, setOfflineMsg] = useState<string>('')

  const { sendMessage, sendJsonMessage } = useWebSocket(url, {
    onOpen: () => {
      sendJsonMessage({
        chunk_size: [5, 10, 5],
        wav_name: 'h5',
        is_speaking: true,
        chunk_interval: 10,
        itn: false,
        mode: '2pass',
        hotwords: '{}',
      })
    },
    onMessage: (e) => {
      const data = JSON.parse(e.data)
      if (data.mode === '2pass-online') {
        setOnlineMsg((prev) => prev + data.text)
      } else if (data.mode === '2pass-offline') {
        setOnlineMsg('')
        setOfflineMsg((prev) => prev + data.text)
      }
    },
  })

  const handleProcess = (
    buffer,
    _powerLevel,
    _bufferDuration,
    bufferSampleRate,
  ) => {
    if (isRec.current === true) {
      const data_48k = buffer[buffer.length - 1]

      const array_48k = new Array(data_48k)
      const data_16k = Recorder.SampleData(
        array_48k,
        bufferSampleRate,
        16000,
      ).data

      sampleBuf.current = Int16Array.from([...sampleBuf.current, ...data_16k])
      const chunk_size = 960 // for asr chunk_size [5, 10, 5]
      // info_div.innerHTML = '' + bufferDuration / 1000 + 's'
      while (sampleBuf.current.length >= chunk_size) {
        const sendBuf = sampleBuf.current.slice(0, chunk_size)
        sampleBuf.current = sampleBuf.current.slice(
          chunk_size,
          sampleBuf.current.length,
        )
        sendMessage(sendBuf)
      }
    }
  }

  const rec = useRef(
    Recorder({
      type: 'pcm',
      bitRate: 16,
      sapleRate: 16_000,
      onProcess: handleProcess,
    }),
  )

  const handleStart = () => {
    isRec.current = true
    rec.current.open(() => {
      rec.current.start()
    })
  }

  const handleStop = () => {
    rec.current.stop()
    rec.current.close()
    sendJsonMessage({
      chunk_size: [5, 10, 5],
      wav_name: 'h5',
      is_speaking: false,
      chunk_interval: 10,
      mode: '2pass',
    })
    setOnlineMsg('')
    setOfflineMsg('')
  }

  return {
    onlineMsg,
    offlineMsg,
    handleStart,
    handleStop,
  }
}

export default useASR
