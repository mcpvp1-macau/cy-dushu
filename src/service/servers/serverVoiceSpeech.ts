import config from '@/global/config'
import { unAuthorized, withToken } from './interceptors'
import LiqunAxios from './liqunAxios/liqun-axios'
import { msgMitt } from '@/hooks/useAppMsg'

/** 语音合成服务 */
const serverVoiceSpeech = new LiqunAxios<'any'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/voiceSpeechServer`,
  timeout: 120_000,
})

serverVoiceSpeech.interceptors.request.use(withToken)

serverVoiceSpeech.interceptors.response.use(unAuthorized, unAuthorized)

serverVoiceSpeech.interceptors.response.use((resp) => {
  if (resp.data.error?.message) {
    msgMitt.emit('open', {
      type: 'error',
      content: `${resp.data.error.message}`,
    })
    return Promise.reject(resp.data)
  }
  return resp.data
})

export default serverVoiceSpeech
