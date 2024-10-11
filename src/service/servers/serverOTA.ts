import config from '@/global/config'
import { shouldShowError, unAuthorized, withToken } from './interceptors'
import LiqunAxios from './liqunAxios'

const serverOTA = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/OTAServer`,
  timeout: 60_000,
})

serverOTA.interceptors.request.use(withToken)

serverOTA.interceptors.response.use(unAuthorized, unAuthorized)

serverOTA.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(resp.data)
  }
  return resp.data
})

export default serverOTA
