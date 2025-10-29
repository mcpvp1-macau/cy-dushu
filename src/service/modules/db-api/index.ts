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


export const getActiveTrackPeriods = (data: {
  deviceId: string
  startTime: string
  endTime: string
}) => {
  return serverDBAPI.post('api/getActiveTrackPeriods', data)
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

/** 获取设备健康日志 */
export const getDeviceHealthLogs = (data: {
  deviceId: string
  startTime: string
  endTime: string
}) => {
  return serverDBAPI.post<API_DBAPI.res.GetDeviceHealthLogsRes>(
    'api/deviceHealthLogs',
    data,
  )
}

/** 获取设备操作日志 */
export const getDeviceOperateLogs = (data: {
  deviceId: string
  startTime: string
  endTime: string
}) => {
  return serverDBAPI.post<API_DBAPI.res.GetDeviceOperateLogsRes>(
    'api/deviceOperateLogs',
    data,
  )
}

/** 获取设备容量枚举 */
export const getDeviceCapacityEnum = () => {
  return serverDBAPI.post<API_DBAPI.res.GetDeviceCapacityEnumRes>(
    'api/deviceCapacityEnum',
    {},
  )
}

/** 获取密集数据 */
export const getDensityStatistics = (data: {
  actionId?: number
  deviceId?: string
  startTime: string
  endTime: string
}) => {
  return serverDBAPI.post<API_DBAPI.res.GetDensityStatisticsRes>(
    '/api/denseDataStatistics',
    data,
  )
}
