import {
  DEMO_DEVICE_TYPES,
  DEMO_FLEET_DEVICES,
} from '@/demo/fixed-wing/constants'
import { XCustomConfig } from '@/service/servers/liqunAxios'
import serverControlCenter from '@/service/servers/serverControlCenter'
import serverJingqi from '@/service/servers/serverJingqi'
import serverOTA from '@/service/servers/serverOTA'
import serverVod from '@/service/servers/serverVod'

/** 演示模式统一响应包装 (保留 data 类型) */
const demoResp = <T>(data: T): Promise<{ data: T } & Record<string, any>> =>
  Promise.resolve({ code: 'SUCCESS', message: 'demo', data })

/** 演示设备按类型过滤 (固定翼并入无人机类目) */
const filterDemoDevices = (type?: string) => {
  if (!type) {
    return DEMO_FLEET_DEVICES
  }
  if (type === 'UAV') {
    return DEMO_FLEET_DEVICES.filter(
      (e) => e.deviceType === 'UAV' || e.deviceType === 'FIXED_WING',
    )
  }
  return DEMO_FLEET_DEVICES.filter((e) => e.deviceType === type)
}

/** 获取所有设备类型 */
export const getAllDeviceType = () => {
  if (globalConfig.demoMode) {
    return demoResp<API_DEVICE.res.DeviceTypeListRes>({
      rows: DEMO_DEVICE_TYPES,
    } as API_DEVICE.res.DeviceTypeListRes)
  }
  return serverControlCenter.get<API_DEVICE.res.DeviceTypeListRes>(
    '/device/type/list/v3',
  )
}

/** 演示设备树根节点 */
const buildDemoDeviceTree = (
  type?: string,
  name?: string,
): API_DEVICE.domain.DeviceTreeItem => {
  const devices = filterDemoDevices(type).filter(
    (e) => !name || e.deviceName.includes(name),
  )
  return {
    groupId: 'demo-root',
    groupName: '演示中队',
    devices: devices as unknown as API_DEVICE.domain.Device[],
    children: [],
  }
}

/** 获取设备 tree */
export const getDeviceTree = (
  data: API_DEVICE.req.GetDeviceTreeReq & { name?: string; type?: string },
) => {
  if (globalConfig.demoMode) {
    return demoResp<API_DEVICE.res.DeviceTreeRes>(
      buildDemoDeviceTree(data.type, data.name),
    )
  }
  return serverControlCenter.post<API_DEVICE.res.DeviceTreeRes>(
    '/device/list/tree/v3',
    data,
  )
}

/** 获取设备 tree v4 */
export const getDeviceTreeV4 = (
  data: API_DEVICE.req.GetDeviceTreeV4Req & { name?: string; type?: string },
) => {
  if (globalConfig.demoMode) {
    return demoResp<API_DEVICE.res.DeviceTreeV4Res>({
      roots: [buildDemoDeviceTree(data.type, data.name)],
    })
  }
  return serverControlCenter.post<API_DEVICE.res.DeviceTreeV4Res>(
    '/device/list/tree/v4',
    data,
  )
}

/** 获取目标点的推荐设备列表 */
export const getRecommendDeviceList = (data: {
  longitude: number
  latitude: number
}) => {
  return serverControlCenter.post('/recommend/device/list', data)
}

/** 获取所有设备 (jingqi) */
export const getAllDeviceList = (data: API_DEVICE.req.GetDeviceListReq) => {
  return serverJingqi.post<API_DEVICE.res.AllDeviceListRes>(
    '/device/list',
    data,
  )
}

/** 获取所有设备 (control-center) */
export const getAllDeviceListV3 = (data: {
  type?: string
  isPage?: boolean
}) => {
  if (globalConfig.demoMode) {
    const rows = filterDemoDevices(data.type)
    return demoResp<API_DEVICE.res.AllDeviceListV3Res>({
      rows,
      total: rows.length,
    } as unknown as API_DEVICE.res.AllDeviceListV3Res)
  }
  return serverControlCenter.post<API_DEVICE.res.AllDeviceListV3Res>(
    '/device/list/v3',
    data,
  )
}

export const getAllDeviceListOta = (data: any) => {
  if (globalConfig.demoMode) {
    const rows = filterDemoDevices(data.type)
    return demoResp<API_DEVICE.res.AllDeviceListV3OTARes>({
      rows: rows.map((e) => ({ ...e, deviceModel: 'demo' })),
      total: rows.length,
    } as unknown as API_DEVICE.res.AllDeviceListV3OTARes)
  }
  return serverControlCenter.post<API_DEVICE.res.AllDeviceListV3OTARes>(
    '/device/list/v3/ota',
    data,
  )
}

export const getDeviceDetail = (deviceId: string) => {
  return serverControlCenter.post<API_DEVICE.res.DeviceDetailRes>(
    `/device/detail/v3`,
    { deviceId },
  )
}

/** 设备设置属性 */
export const setDeviceProp = (
  productKey: string,
  deviceId: string,
  data: Record<string, any>,
  xCustomConfig: XCustomConfig = {},
) => {
  return serverControlCenter.post(
    `/v3/properties/${productKey}/${deviceId}/post`,
    data,
    { xCustomConfig },
  )
}

/** 设备设置属性 */
export const setDeviceConfig = (
  productKey: string,
  deviceId: string,
  data: Record<string, any>,
  xCustomConfig: XCustomConfig = {},
) => {
  return serverControlCenter.post(
    `/v3/properties/${productKey}/${deviceId}/config/post`,
    data,
    { xCustomConfig },
  )
}

/** 望楼设置属性 */
export const setWanglouConfig = (
  productKey: string,
  deviceId: string,
  data: Record<string, any>,
  xCustomConfig: XCustomConfig = {},
) => {
  return serverControlCenter.post(
    `/v3/service/${productKey}/${deviceId}/config/post`,
    data,
    { xCustomConfig },
  )
}

export const setProperty = (
  productKey: string,
  deviceId: string,
  params: any,
) => {
  return serverControlCenter.post(
    `/v3/operate/upload/${productKey}/${deviceId}/property/set`,
    params,
  )
}

/** 设备能力调用 */
export const postDeviceService = (
  productKey: string,
  deviceId: string,
  identifier: string,
  data: any,
) => {
  return serverControlCenter.post(
    `/v3/service/${productKey}/${deviceId}/${identifier}/post`,
    data,
    {
      xCustomConfig: {
        autoShowMessageOnNotSuccess: false,
      },
    },
  )
}

/** 更新 OTA 接口 */
export const updateOtaDevice = async (data?: { deviceId: string }) => {
  return serverOTA.get('/ota/createDeployment', {
    params: data,
  })
}

export const updateOtaDeviceDJI = async (data?: {
  deviceSn: string
  deviceName: string
  latestFirmwareVersion: string
}) => {
  return serverControlCenter.post('/device/upgrade', [data])
}

export const getProductFieldsByIdentifier = async (data: {
  functionIdentifier: string
}) => {
  return serverControlCenter.post('/manage/product/field/list/search', data)
}

export const updateDevice = async (data: {
  deviceId: string
  productKey: string
  ttpBoxSn: string
}) => {
  return serverControlCenter.post('/manage/device/update', data)
}

/** 获取历史视频 */
export const getHistoryVideo = async (
  productKey: string,
  deviceId: string,
  id: string,
  data: { startTime: string; endTime: string },
) => {
  return serverControlCenter.post<API_DEVICE.res.GetHistoryListRes>(
    `/v3/service/${productKey}/${deviceId}/history/post`,
    {
      videoId: id,
      begin: data.startTime,
      end: data.endTime,
      transport: 'HLS',
    },
  )
}
/** 获取历史视频 */
export const getHistoryVideo2 = async (
  productKey: string,
  deviceId: string,
  id: string,
  data: {
    startTime: string
    endTime: string
    isProxy?: boolean
    proxyPrefix?: string
  },
) => {
  return serverVod.post<API_DEVICE.res.GetHistoryListRes>(
    `/vod/${productKey}/${deviceId}/history`,
    {
      videoId: id,
      begin: data.startTime,
      end: data.endTime,
      transport: 'HLS',
    },
  )
}

/** 获取历史视频 */
export const getHistoryM3u8Video = async (
  productKey: string,
  deviceId: string,
  id: string,
  data: {
    startTime: string
    endTime: string
    isProxy: boolean
    proxyPrefix: string
  },
) => {
  return serverControlCenter.post<API_DEVICE.res.GetHistoryListRes>(
    `/v3/service/${productKey}/${deviceId}/m3u8/post`,
    {
      videoId: id,
      begin: data.startTime,
      end: data.endTime,
      transport: 'HLS',
      isProxy: data.isProxy,
      proxyPrefix: location.origin + data.proxyPrefix,
    },
  )
}

/** 上传截图 */
export const uploadPic = (
  productKey: string,
  deviceId: string,
  data: {
    bid?: string
    bType?: string
    imgData: string
    fileId?: string
  },
) => {
  return serverControlCenter.post('/v3/media/picture/upload', {
    productKey,
    deviceId,
    ...data,
  })
}

/** 设备链路查询接口 */
export const getDeviceLinks = (data: {
  productKey: string
  deviceId: string
}) => {
  // return request<API.Response<{ links: DeviceLinksApi.results.DeviceLink[] }>>(
  //   `${baseURL}/v3/device/queryLinks`,
  //   {
  //     method: 'POST',
  //     data,
  //   },
  // );
  return serverControlCenter.post<API_DEVICE.res.GetDeviceLinkRes>(
    '/v3/device/queryLinks',
    data,
    {
      xCustomConfig: {
        msgPrefix: '获取设备链路失败',
      },
    },
  )
}

/** 设备主要活动链路设置接口 */
export const setDeviceLink = (data: {
  deviceId: string
  linkId: string
  productKey: string
}) => {
  return serverControlCenter.post('/v3/device/setActiveLink', data, {
    xCustomConfig: {
      msgPrefix: '设置设备链路失败',
    },
  })
}

/** 获取无人机一机一档详情 */
export const getUavDocDetail = (sn: string) => {
  return serverJingqi.post<API_DEVICE.res.GetUavDocDetailRes>(
    `/device/doc/get`,
    { sn },
  )
}

/** 获取一机一档所有sn */
export const getUavDocSnList = () => {
  return serverJingqi.get<string[]>(`/device/doc/sn/list`)
}
