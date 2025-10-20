import config from '@/global/config'
import {
  formatThrowError,
  shouldShowError,
  unAuthorized,
  withInternational,
  withToken,
} from './interceptors'
import LiqunAxios from './liqunAxios'

const serverDushu = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/dushuServer`,
  timeout: 60_000,
})

serverDushu.interceptors.request.use(withToken)
serverDushu.interceptors.request.use(withInternational)

serverDushu.interceptors.response.use(unAuthorized, unAuthorized)

serverDushu.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(formatThrowError(resp))   
  }
  return resp.data
})

export default serverDushu
