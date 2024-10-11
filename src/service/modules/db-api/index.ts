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
