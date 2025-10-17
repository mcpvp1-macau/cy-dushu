import { useAsyncEffect } from 'ahooks'
import { audioMap, WarningAlertType } from './warning_alert_constants'

/** 警报声音频缓存 */
const useWarningAudioBuffer = () => {
  const [audioBuffers, setAudioBuffers] = useState<Record<
    WarningAlertType,
    AudioBuffer | null
  > | null>(null)

  useAsyncEffect(async () => {
    const resp = await Promise.allSettled(
      Array.from(new Set(Object.values(audioMap))).map(async (url) => {
        const resp = await fetch(url)
        const buffer = await resp.arrayBuffer()
        const audioCtx = new AudioContext()
        const audioBuffer = await audioCtx.decodeAudioData(buffer)
        return { url, audioBuffer }
      }),
    )

    const urlMap: Record<string, AudioBuffer> = {}
    resp.forEach((r) => {
      if (r.status === 'fulfilled') {
        urlMap[r.value.url] = r.value.audioBuffer
      }
    })

    setAudioBuffers(
      Object.entries(audioMap).reduce((acc, [key, url]) => {
        acc[key as WarningAlertType] = urlMap[url] || null
        return acc
      }, {} as Record<WarningAlertType, AudioBuffer | null>),
    )
  }, [])

  return audioBuffers
}

export default useWarningAudioBuffer
