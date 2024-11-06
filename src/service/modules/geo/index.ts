import serverGeoSearch from '@/service/servers/serverGeoSearch'

/** 地理坐标筛选 */
export const getGeoSearchData = (params: {
  lng0: number
  lat0: number
  lng1: number
  lat1: number
}) => {
  return serverGeoSearch.get('/search', { params })
}
