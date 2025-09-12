import serverVoiceSpeech from '@/service/servers/serverVoiceSpeech'

/** 文字转语音 */
export const textToSpeech = async (text: string) => {
  return serverVoiceSpeech.post(
    '/v1/audio/speech',
    {
      input: text,
      voice: 'girl',
      model: 'fish-speech',
    },
    {
      responseType: 'blob',
    },
  )
}

/** 语音转文字 */
export const transcribeAudio = async (file: File, signal?: AbortSignal) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('model', 'omni-transcribe')
  formData.append('language', 'zh')

  return serverVoiceSpeech.post('/v1/audio/transcriptions', formData, {
    signal,
  })
}
