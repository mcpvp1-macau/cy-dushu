import { useEventData } from '@/store/event/useEvent.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { useThrottleFn } from 'ahooks'
import { globalToastEmitter } from '../GlobalToast'
import { WarningOutlined } from '@ant-design/icons'
import { RightModeEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import useWarnningSettingStore from '@/store/setting/useWarnningSetting.store'

const useHandlePushEvent = () => {
  const { refetch } = useEventData()

  const { run } = useThrottleFn(
    () => {
      refetch()
    },
    { wait: 2000 },
  )
  const updateNewEvent = useGlobalWsStore((s) => s.updateNewEvent)
  const navigate = useNavigate()

  const audioBuffer = useRef<AudioBuffer | null>(null)
  const isPlayingAudio = useRef(false)

  const handleEventPush = useMemoizedFn(async (message: any) => {
    run()
    updateNewEvent(message)

    const rightModeStore = useRightMode.getState()

    const newEvent = message
    globalToastEmitter.emit('notify', {
      id: 'global-event-notify',
      title: (
        <div className="flex gap-1 text-sm font-medium text-white overflow-hidden">
          <WarningOutlined className="text-yellow-400" />
          <p className="truncate max-w-[250px]">
            {newEvent.eventName} ({newEvent.eventId})
          </p>
        </div>
      ),
      description: `来源: [${newEvent.deviceName}]`,
      button: {
        label: '查看',
        onClick: () => {
          rightModeStore.updateRightMode(RightModeEnum.EVENT_DETAIL)
          rightModeStore.updateDetailId(newEvent.eventId)
          navigate('/')
        },
      },
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
