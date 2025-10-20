import config from '@/global/config'
import {
  shouldShowError,
  unAuthorized,
  withInternational,
  withToken,
} from './interceptors'
import LiqunAxios from './liqunAxios'

const serverJingqi = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/jingqiServer`,
  timeout: 60_000,
})

serverJingqi.interceptors.request.use(withToken)
serverJingqi.interceptors.request.use(withInternational)

serverJingqi.interceptors.response.use(unAuthorized, unAuthorized)

serverJingqi.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(
      JSON.stringify({
        code: resp.data?.code,
        message: resp.data?.message,
      }),
    )
  }
  return resp.data
})

export default serverJingqi
