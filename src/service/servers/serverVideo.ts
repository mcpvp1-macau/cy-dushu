import config from '@/global/config'
import {
  formatThrowError,
  shouldShowError,
  unAuthorized,
  withInternational,
  withToken,
} from './interceptors'
import LiqunAxios from './liqunAxios'

const serverVideo = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/videoServer`,
  timeout: 60_000,
})

serverVideo.interceptors.request.use(withToken)
serverVideo.interceptors.request.use(withInternational)

serverVideo.interceptors.response.use(unAuthorized, unAuthorized)

serverVideo.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(formatThrowError(resp))
  }
  return resp.data
})

const serverVod = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/vodServer`,
  timeout: 60_000,
})

serverVod.interceptors.request.use(withToken)

serverVod.interceptors.response.use(unAuthorized, unAuthorized)

serverVod.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(resp.data)
  }
  return resp.data
})

export { serverVod }

export default serverVideo
