declare namespace API_DBAPI {
  // ----------------- domain ----------------
  namespace domain {
    interface PlatformCaptureRecord {
      sourceId: string
      gmtCreateBy: string
      gmtModifiedBy: string
      type: string
      deviceId: string
      url: string
      bType?: any
      extends: string
      width: any
      startTime: string
      id: number
      sourceName: string
      endTime: string
      bid: string
      height?: any
      longitude?: number
      latitude?: number
    }
    interface TrackPoint {
      deviceType: any
      lng: number
      lat_84: any
      lng02Rectify: any
      lat02Rectify: any
      spaceType: any
      attitudeHead: number
      type: any
      deviceId: string
      deviceName: any
      spaceId: any
      lngGaode: number
      latGaode: number
      gimbalHead: number
      acquisitionTimeFormat: string
      acquisitionTime: number
      lat: number
      objectId: any
      lng_84: any
      altitude: number
    }
    interface RIDUavData {
      /** 信号强度 (dBm) */
      rssi: number
      /** 探测到的无人机纬度 (精确到小数点后6位) */
      lat: number
      /** 控制无人机人员经度 */
      controlStationLng: number
      /** 控制无人机人员纬度 */
      controlStationLat: number
      /** 航迹角 (度) */
      ew: number
      /** 高度类型 (0: 相对高度, 1: 绝对高度) */
      heightType: number
      /** 气压高度 (米) */
      locationAlit: number
      /** 无人机地速 - 水平速度 (米/秒) */
      speedH: number
      /** 采集时间 (YYYY-MM-DD HH:mm:ss) */
      acquireTimestampFormat: string
      /** 垂直速度 (米/秒) */
      speedV: number
      /** 采集时间 (YYYY-MM-DD HH:mm:ss) */
      acquireTime: string
      /** 无人机ID */
      id: string
      /** 经度 */
      lng: number
      /** 高度 (米) */
      height: number
      /** 水平加速度 (米/秒²) */
      speedAcc?: number
      /** 垂直加速度 (米/秒²) */
      vertAcc?: number
      /** 水平精度 (米) */
      horiAcc?: number
      /** 航迹角 (度) */
      orientation: number
    }
    interface RIDUavData {
      /** 信号强度 (dBm) */
      rssi: number
      /** 探测到的无人机纬度 (精确到小数点后6位) */
      lat: number
      /** 控制无人机人员经度 */
      controlStationLng: number
      /** 控制无人机人员纬度 */
      controlStationLat: number
      /** 航迹角 (度) */
      ew: number
      /** 高度类型 (0: 相对高度, 1: 绝对高度) */
      heightType: number
      /** 气压高度 (米) */
      locationAlit: number
      /** 无人机地速 - 水平速度 (米/秒) */
      speedH: number
      /** 采集时间 (YYYY-MM-DD HH:mm:ss) */
      acquireTimestampFormat: string
      /** 垂直速度 (米/秒) */
      speedV: number
      /** 采集时间 (YYYY-MM-DD HH:mm:ss) */
      acquireTime: string
      /** 无人机ID */
      id: string
      /** 经度 */
      lng: number
      /** 高度 (米) */
      height: number
      /** 水平加速度 (米/秒²) */
      speedAcc?: number
      /** 垂直加速度 (米/秒²) */
      vertAcc?: number
      /** 水平精度 (米) */
      horiAcc?: number
      /** 航迹角 (度) */
      orientation: number
    }

    /**
     * 无人机基本信息
     */
    interface UavInfo {
      /** 无人机名称 */
      name: string
      /** 型号 */
      model: string
      /** 类别 */
      category: string
      /** 类型 */
      type: string
      /** 无人机ID */
      id: string
      /** 来源 */
      source: string
      /** 厂商 */
      manufacturer: string
      /** 所有者 */
      owner: string
      /** 电话 */
      phone: string
      /** 空机重量 */
      emptyWeight: number
      /** 最大起飞重量 */
      maximumTakeoffWeight: number
      /** 用途 */
      purpose: string
      /** 采集时间 */
      acquireTime: string
      /** 无人机设备ID - 牍术接入的 */
      uavDeviceId: string
      /** RID 设备ID - 飞机上报的 */
      ridDevid: string
      /** 消息类型 */
      msgtype: number
      /** 无人机数据类型，示例：2.4G */
      recvtype: string
      /** RID 设备MAC地址 */
      mac: string
      /** 信号强度 */
      rssi: number
      /** 探测到的无人机经度（精确到小数点后6位） */
      longitude: number
      /** 探测到的无人机纬度（精确到小数点后6位） */
      latitude: number
      /** 气压高度 */
      locationAlit: number
      /** 航迹角 */
      ew: number
      /** 无人机地速 - 水平速度 */
      speedH: number
      /** 垂直速度 */
      speedV: number
      /** 无人机距地高度 */
      height: number
      /** 高度类型 */
      heightType: number
      /** 控制站经度 */
      controlStationLng: number
      /** 控制站纬度 */
      controlStationLat: number
      /** 图片地址 */
      imageUrl?: string // 图片地址可能为空
    }

    /**
     * 飞行员基本信息
     */
    interface PilotInfo {
      /** ID */
      id: string
      /** 名称 */
      name: string
      /** 身份证号 */
      cardCode: string
      /** 电话 */
      phone: string
      /** 邮箱 */
      email: string
      /** 地址 */
      address: string
      /** 登记无人机 */
      registerUav: string
      /** 图片地址 */
      imageUrl?: string // 图片地址可能为空
    }

    /**
     * 控制站基本信息
     */
    interface ControlStationInfo {
      /** ID */
      id: string
      /** 数据更新时间 */
      acquireTime: string
      /** 图片地址 */
      imageUrl?: string // 图片地址可能为空
    }

    interface EventPhotoEnumItem {
      sort?: number
      value?: string
      key?: string
    }

    export interface TargetData {
      latitude: number
      id: string
      time: string
      type: string
      objectLabel: string
      longitude: number
    }
    type HealthLog = {
      messageInfo: string
      startTime: string
      endTime: string
    }
    type OperateLog = {
      method: string
      acquireTime: string
      productKey: string
      type: string
      properties: string
      operator: string
      messageInfo: string
    }
    type DeviceCapacityEnum = {
      functionName: 'events' | 'services' | 'properties'
      id: number
      functionType: string
      functionIdentifier: string
      productKey: string
      productName: string
    }

    type DensityItem = {
      deviceId: string
      h3Code: string
      /** 层级 */
      resolution: number
      /** 该地区的过去一段时间的平均人数 */
      averageDensity: number
      /** 单位秒，表示统计人群密度的间隔 */
      statisticalInterval: number
      /** 采集时间 */
      acquireTimestampFormat: string
    }

    type AlarmLevel = 'Info' | 'Warn' | 'Error'

    interface AlarmRecord {
      alarmId: string
      time: string
      deviceName: string
      deviceId: string
      sn: string
      groupId: string
      alarmLevel: AlarmLevel
      msg: string
      processStatus: 'PROCESSED' | 'UNPROCESSED'
      alarmTypeId?: number
      processUsername?: string | null
      processTime?: string | null
      processMsg?: string | null
    }
  }

  // ------------------ req ------------------
  namespace req {
    type GetPlatformCaptureReq = {
      actionId?: string
      deviceId?: string
      type: 'PICTURE' | 'HISTORY_VIDEO'
      photoType?: string[]
      sourceId?: string
      startTime?: string
      endTime?: string
      page?: number
      pageSize?: number
      isPage?: boolean
    }
    interface WirelessSituation {
      startTime: string
      endTime: string
      minHeight: number
      maxHeight: number
      deviceId?: string
      level: number
    }

    type AlarmQueryReq = {
      startTime?: string
      endTime?: string
      processStatus?: 'PROCESSED' | 'UNPROCESSED'
      deviceId?: string
      deviceName?: string
      sn?: string
      groupId?: string
      pageNum?: number
      pageSize?: number
    }

    type AlarmBatchUpdateReq = {
      alarmIds: string[]
      processUsername?: string
      isDeleted: 0 | 1
      processMsg?: string
    }

    type AlarmBatchDeleteReq = {
      alarmIds: string[]
    }
  }
  // ------------------ res ------------------
  namespace res {
    type GetPlatformCaptureRes = [
      API_DBAPI.domain.PlatformCaptureRecord[],
      [{ cnt: number }],
    ]
    type GetTrackQueryRes = API_DBAPI.domain.TrackPoint[]

    type getCitySituationUavTrack = API_DBAPI.domain.RIDUavData[]
    type GetCitySituationUavDetail = {
      /** 无人机基本信息 */
      uavInfo: domain.UavInfo[]
      /** 飞行员基本信息 */
      pilotInfo: domain.PilotInfo[]
      /** 控制站基本信息 */
      controlStationInfo: domain.ControlStationInfo[]
    }
    export type GetAllTargets = domain.TargetData[]

    type GetDeviceHealthLogsRes = API_DBAPI.domain.HealthLog[]
    type GetDeviceOperateLogsRes = API_DBAPI.domain.OperateLog[]
    type GetDeviceCapacityEnumRes = API_DBAPI.domain.DeviceCapacityEnum[]
    type GetDensityStatisticsRes = API_DBAPI.domain.DensityItem[]
    type EventPhotoEnumListRes = API_DBAPI.domain.EventPhotoEnumItem[]

    type AlarmQueryRes = {
      list: API_DBAPI.domain.AlarmRecord[]
      count: { cnt: number }[]
    }
  }
}
