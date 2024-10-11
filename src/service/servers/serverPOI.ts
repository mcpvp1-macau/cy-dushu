import config from '@/global/config'
import { shouldShowError, unAuthorized, withToken } from './interceptors'
import LiqunAxios from './liqunAxios'

const serverPOI = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/POIServer`,
  timeout: 60_000,
})

serverPOI.interceptors.request.use(withToken)

serverPOI.interceptors.response.use(unAuthorized, unAuthorized)

serverPOI.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(resp.data)
  }
  return resp.data
})

export default serverPOI
