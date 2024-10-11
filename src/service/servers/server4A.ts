import { shouldShowError, unAuthorized, withToken } from './interceptors'
import LiqunAxios from './liqunAxios'

const server4A = new LiqunAxios<'common'>({
  baseURL: '/proxyApi',
  timeout: 20_000,
})

server4A.interceptors.request.use(withToken)

server4A.interceptors.response.use(unAuthorized, unAuthorized)

server4A.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(resp.data)
  }
  return resp.data
})

export default server4A
