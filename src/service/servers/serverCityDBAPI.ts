import config from '@/global/config'
import { unAuthorized, withInternational, withToken } from './interceptors'
import LiqunAxios from './liqunAxios/liqun-axios'
import { Responses } from './liqunAxios'
import { msgMitt } from '@/hooks/useAppMsg'

const serverCityDBAPI = new LiqunAxios<'dbApi'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/cityDBApiServer`,
  timeout: 120_000,
})

serverCityDBAPI.interceptors.request.use(withToken)
serverCityDBAPI.interceptors.request.use(withInternational)

serverCityDBAPI.interceptors.response.use(unAuthorized, unAuthorized)
serverCityDBAPI.interceptors.response.use((resp) => resp.data)

serverCityDBAPI.interceptors.response.use((fresp) => {
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

export default serverCityDBAPI
