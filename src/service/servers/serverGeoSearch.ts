import config from '@/global/config'
import { unAuthorized, withInternational, withToken } from './interceptors'
import LiqunAxios from './liqunAxios'

const serverGeoSearch = new LiqunAxios<'common'>({
  baseURL: `/proxyApi/otherService/${config.systemName}/geoSearchServer`,
  timeout: 180_000,
})

serverGeoSearch.interceptors.request.use(withToken)
serverGeoSearch.interceptors.request.use(withInternational)

serverGeoSearch.interceptors.response.use(unAuthorized, unAuthorized)

serverGeoSearch.interceptors.response.use((resp) => resp.data)

export default serverGeoSearch
