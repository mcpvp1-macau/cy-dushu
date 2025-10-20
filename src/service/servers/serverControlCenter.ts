import config from '@/global/config'
import {
  formatThrowError,
  shouldShowError,
  unAuthorized,
  withInternational,
  withToken,
} from './interceptors'
import LiqunAxios from './liqunAxios'

const serverControlCenter = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/controlServer`,
  timeout: 60_000,
})

serverControlCenter.interceptors.request.use(withToken)
serverControlCenter.interceptors.request.use(withInternational)

serverControlCenter.interceptors.response.use(unAuthorized, unAuthorized)

serverControlCenter.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    if(resp.config.url?.includes('/live/post')){
      return Promise.reject(resp.data) 
    } else {
      return Promise.reject(formatThrowError(resp))
    }
  }
  return resp.data
})

export default serverControlCenter
