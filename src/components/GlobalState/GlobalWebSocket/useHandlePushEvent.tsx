import { useEventData } from '@/store/event/useEvent.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import useWarnningSettingStore from '@/store/setting/useWarnningSetting.store'
import { shouldJson } from '@/utils/json'
import { useMemoizedFn, useThrottleFn } from 'ahooks'
import { useRef } from 'react'
import { globalToastEmitter } from '../GlobalToast'
import AlarmToast from './AlarmToast'
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

  const audioContext = useRef<AudioContext | null>(null)
  const audioBuffer = useRef<AudioBuffer | null>(null)
  const isPlayingAudio = useRef(false)

  const playWarningAudio = useMemoizedFn(async () => {
    const isHaveAudio = useWarnningSettingStore.getState().isHaveAvdio
    if (!isHaveAudio) {
      return
    }

    if (!audioContext.current) {
      audioContext.current = new AudioContext()
    }

    if (!audioBuffer.current) {
      const resp = await fetch(globalConfig.warnAudioUrl || '/images/4611.wav')
      const buffer = await resp.arrayBuffer()
      audioBuffer.current = await audioContext.current.decodeAudioData(buffer)
    }

    if (audioContext.current && audioBuffer.current && !isPlayingAudio.current) {
      const source = audioContext.current.createBufferSource()
      source.buffer = audioBuffer.current
      source.connect(audioContext.current.destination)
      isPlayingAudio.current = true
      source.start(0)
      source.onended = () => {
        source.disconnect()
        isPlayingAudio.current = false
      }
    }
  })

  const handleEventPush = useMemoizedFn(async (message: any) => {
    run()
    updateNewEvent(message)

    const newEvent = message
    const isAllowEventNotification =
      useWarnningSettingStore.getState().isAllowEventNotification
    if (isAllowEventNotification) {
      globalToastEmitter.emit('notifyCustom', {
        id: 'global-event',
        element: <EventToast data={newEvent} />,
      })
    }

    await playWarningAudio()
  })

  const handleAlarmPush = useMemoizedFn(async (message: any) => {
    const alarm = shouldJson(message) ?? message

    if (!alarm) {
      return
    }

    const isAllowAlarmNotification =
      useWarnningSettingStore.getState().isAllowAlarmNotification
    if (!isAllowAlarmNotification) {
      return
    }

    const alarmId =
      alarm.alarm_id || alarm.alarmId || alarm.msg || alarm.device_name || alarm.deviceName

    globalToastEmitter.emit('notifyCustom', {
      id: alarmId || `alarm-${Date.now()}`,
      element: <AlarmToast data={alarm} />,
    })

    await playWarningAudio()
  })

  return { handleAlarmPush, handleEventPush }
}

export default useHandlePushEvent
