import config from '@/global/config'
import {
  formatThrowError,
  shouldShowError,
  unAuthorized,
  withInternational,
  withToken,
} from './interceptors'
import LiqunAxios from './liqunAxios'

const serverUavXiaoshan = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/uavXiaoshan`,
  timeout: 60_000,
})

serverUavXiaoshan.interceptors.request.use(withToken)
serverUavXiaoshan.interceptors.request.use(withInternational)

serverUavXiaoshan.interceptors.response.use(unAuthorized, unAuthorized)

serverUavXiaoshan.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(formatThrowError(resp))
  }
  return resp.data
})

export default serverUavXiaoshan
