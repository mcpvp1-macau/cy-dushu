import serverGeoSearch from '@/service/servers/serverGeoSearch'

type GeoRect = {
  lng0: number
  lat0: number
  lng1: number
  lat1: number
}

/** 地理坐标筛选 */
export const getGeoSearchData = (params: GeoRect) => {
  return serverGeoSearch.get('/search', { params })
}

/** 获取 AOI 数据 */
export const getGeoSearchAOIData = (params: GeoRect) => {
  return serverGeoSearch.get<API_GEO_SERACH.res.AOIDataRes>('/search/aoi', {
    params,
  })
}

/** 获取 POI 数据 */
export const getGeoSearchPOIData = (params: GeoRect) => {
  return serverGeoSearch.get<API_GEO_SERACH.res.POIDataRes>('/search/poi', {
    params,
  })
}

/** 获取 道路 数据 */
export const getGeoSearchRoadData = (params: GeoRect) => {
  return serverGeoSearch.get<API_GEO_SERACH.res.RoadDataRes>('/search/road', {
    params,
  })
}
