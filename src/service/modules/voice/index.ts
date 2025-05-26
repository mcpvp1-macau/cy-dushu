import serverVoiceSpeech from '@/service/servers/serverVoiceSpeech'

/** 文字转语音 */
export const textToSpeech = async (text: string) => {
  return serverVoiceSpeech.post(
    '/v1/audio/speech',
    {
      input: text,
      voice: 'xw',
    },
    {
      responseType: 'blob',
    },
  )
}
