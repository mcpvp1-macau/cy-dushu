import serverDBAPI from '@/service/servers/serverDBAPI'
import { AxiosRequestConfig } from 'axios'

export const getPlatformCapture = (
  data: API_DBAPI.req.GetPlatformCaptureReq,
) => {
  return serverDBAPI.post<API_DBAPI.res.GetPlatformCaptureRes>(
    '/api/platformCapturePost',
    data,
  )
}

/** 电磁态势 */
export const getWirelessSituation = (
  data: API_DBAPI.req.WirelessSituation,
  config?: AxiosRequestConfig,
) => serverDBAPI.post('/api/wireless/union', data, config)

/** 历史轨迹 */
export const getTrackQuery = (data: {
  deviceId: string
  startTime: string
  endTime: string
}) => {
  return serverDBAPI.post<API_DBAPI.res.GetTrackQueryRes>(
    '/api/trackQuery',
    data,
  )
}

/** 无人机属性回溯 */
export const getUavDeviceAttrBackV2 = (data: {
  deviceId: string
  startTime: string
  endTime: string
}) => {
  return serverDBAPI.post('api/uavDeviceAttrBackV2', data)
}

/** deviceAttrInfoBack 属性回溯 */
export const getDeviceAttrInfoBack = (data: {
  deviceId: string
  startTime: string
  endTime: string
}) => {
  return serverDBAPI.post('api/deviceAttrInfoBack', data)
}

/**
 * 目标回溯
 * @param data
 * @returns
 */
export const getTargetPositionBack = (data: {
  parentId: string
  startTime: string
  endTime: string
}) => {
  return serverDBAPI.post('api/targetPositionBack', data)
}

export const getGlobalDeviceLocationRetrieval = (data: {
  deviceIdArrays?: string[]
  startTime: string
  endTime: string
}) => {
  return serverDBAPI.post('api/globalDeviceLocationRetrieval', data)
}

export const getTrackQueryMultiDeviceV2 = (data: {
  deviceId: string[]
  startTime: string
  endTime: string
}) => {
  return serverDBAPI.post('api/trackQueryMultiDeviceV2', data)
}

/**
 * 检测数据
 */
export const getEventDataTargetList = (data: {
  sourceType: string[]
  deviceId: string
  startTime: string
  endTime: string
  objectLabel: string[]
}) => {
  return serverDBAPI.post('api/eventDataTargetList', data)
}

/**
 * 目标详情
 */
export const getTargetDetail = (data: {
  parentId?: string //父设备id ，没有就是设备id
  deviceId: string //	设备id
  targetId: string | number // 目标id
  sourceType: string
  time: string
}) => {
  return serverDBAPI.post('api/targetDetailV2', data)
}

// 检测数据类型字典 [https://jingan.yuque.com/staff-ycgiyb/od1rat/soebmyfa1pgaklzl#QkJH1]
export async function targetListEnumDict(options: any) {
  return serverDBAPI.post(`/api/targetListEnumDict`, options)
}

// 无人机属性回溯
export const getCitySituationUavTrack = (data: {
  id: string[]
  startTime: string
  endTime: string
}) => {
  return serverDBAPI.post<API_DBAPI.res.getCitySituationUavTrack>(
    'api/citySituationUavTrack',
    data,
  )
}

// 无人机属性详情 [https://jingan.yuque.com/staff-ycgiyb/od1rat/gqun0orpa7cwpzqh#u1Vsq]
export const getCitySituationUavDetail = (data: {
  id: string
  startTime?: string
  endTime?: string
}) => {
  return serverDBAPI.post<API_DBAPI.res.GetCitySituationUavDetail>(
    'api/citySituationUavDetail',
    data,
  )
}
