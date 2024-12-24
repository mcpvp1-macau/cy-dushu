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
