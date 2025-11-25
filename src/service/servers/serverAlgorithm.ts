import config from '@/global/config'
import {
  formatThrowError,
  shouldShowError,
  unAuthorized,
  withInternational,
  withToken,
} from './interceptors'
import LiqunAxios from './liqunAxios'

const serverAlgorithm = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/algorithmService`,
  timeout: 60_000,
})

serverAlgorithm.interceptors.request.use(withToken)
serverAlgorithm.interceptors.request.use(withInternational)

serverAlgorithm.interceptors.response.use(unAuthorized, unAuthorized)

serverAlgorithm.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(resp.data)
  }
  return resp.data
})

export default serverAlgorithm
