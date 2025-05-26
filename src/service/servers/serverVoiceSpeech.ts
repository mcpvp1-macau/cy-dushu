import config from '@/global/config'
import { unAuthorized, withToken } from './interceptors'
import LiqunAxios from './liqunAxios/liqun-axios'

/** 语音合成服务 */
const serverVoiceSpeech = new LiqunAxios<'dbApi'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/voiceSpeechServer`,
  timeout: 120_000,
})

serverVoiceSpeech.interceptors.request.use(withToken)

serverVoiceSpeech.interceptors.response.use(unAuthorized, unAuthorized)

export default serverVoiceSpeech
