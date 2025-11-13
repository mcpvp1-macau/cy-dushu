import { useEventData } from '@/store/event/useEvent.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { useThrottleFn } from 'ahooks'
import { globalToastEmitter } from '../GlobalToast'
import useWarnningSettingStore from '@/store/setting/useWarnningSetting.store'
import EventToast from './EventToast'

const useHandlePushEvent = () => {
  const { refetch } = useEventData()

  const { run } = useThrottleFn(
    () => {
      refetch()
    },
    { wait: 2000 },
  )
  const updateNewEvent = useGlobalWsStore((s) => s.updateNewEvent)

  const audioBuffer = useRef<AudioBuffer | null>(null)
  const isPlayingAudio = useRef(false)

  const handleEventPush = useMemoizedFn(async (message: any) => {
    run()
    updateNewEvent(message)

    const newEvent = message
    globalToastEmitter.emit('notifyCustom', {
      id: 'global-event',
      element: <EventToast data={newEvent} />,
    })

    // 播放声音 -------------------------------------------------------------------
    const isHaveAudio = useWarnningSettingStore.getState().isHaveAvdio
    if (!isHaveAudio) {
      return
    }

    const audioCtx = new AudioContext()

    if (!audioBuffer.current) {
      const resp = await fetch(globalConfig.warnAudioUrl || '/images/4611.wav')
      const buffer = await resp.arrayBuffer()
      audioBuffer.current = await audioCtx.decodeAudioData(buffer)
    }

    if (audioBuffer.current && !isPlayingAudio.current) {
      const source = audioCtx.createBufferSource()
      source.buffer = audioBuffer.current
      source.connect(audioCtx.destination)
      isPlayingAudio.current = true
      source.start(0)
      source.onended = () => {
        source.disconnect()
        isPlayingAudio.current = false
      }
    }
  })

  return handleEventPush
}

export default useHandlePushEvent
