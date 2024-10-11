import config from '@/global/config'
import { shouldShowError, unAuthorized, withToken } from './interceptors'
import LiqunAxios from './liqunAxios'

const serverJingqi = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/jingqiServer`,
  timeout: 60_000,
})

serverJingqi.interceptors.request.use(withToken)

serverJingqi.interceptors.response.use(unAuthorized, unAuthorized)

serverJingqi.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(resp.data)
  }
  return resp.data
})

export default serverJingqi
