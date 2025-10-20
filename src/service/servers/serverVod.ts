import config from '@/global/config'
import {
  formatThrowError,
  shouldShowError,
  unAuthorized,
  withInternational,
  withToken,
} from './interceptors'
import LiqunAxios from './liqunAxios'

const serverVod = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/vodServer`,
  timeout: 60_000,
})

serverVod.interceptors.request.use(withToken)
serverVod.interceptors.request.use(withInternational)

serverVod.interceptors.response.use(unAuthorized, unAuthorized)

serverVod.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(formatThrowError(resp))
  }
  return resp.data
})

export default serverVod
