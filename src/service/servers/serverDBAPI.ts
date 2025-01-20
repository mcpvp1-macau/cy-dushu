import config from '@/global/config'
import { unAuthorized, withInternational, withToken } from './interceptors'
import LiqunAxios from './liqunAxios/liqun-axios'
import { Responses } from './liqunAxios'
import { msgMitt } from '@/hooks/useAppMsg'

const serverDBAPI = new LiqunAxios<'dbApi'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/DBApiServer`,
  timeout: 120_000,
})

serverDBAPI.interceptors.request.use(withToken)
serverDBAPI.interceptors.request.use(withInternational)

serverDBAPI.interceptors.response.use(unAuthorized, unAuthorized)
serverDBAPI.interceptors.response.use((resp) => resp.data)

serverDBAPI.interceptors.response.use((fresp) => {
  const resp = fresp as any as Responses<any>['dbApi']
  if (resp.data === null || !resp.success) {
    msgMitt.emit('open', {
      type: 'error',
      content: 'DBAPI Server Error' + (resp.msg ? `: ${resp.msg}` : ''),
    })
    return Promise.reject(resp)
  }
  return fresp
})

export default serverDBAPI
