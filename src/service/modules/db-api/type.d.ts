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
      longitude?: string
      latitude?: string
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
  }
  // ------------------ req ------------------
  namespace req {
    type GetPlatformCaptureReq = {
      deviceId: string
      type: 'PICTURE' | 'HISTORY_VIDEO'
      sourceId?: string
      startTime: string
      endTime: string
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
  }
  // ------------------ res ------------------
  namespace res {
    type GetPlatformCaptureRes = [
      API_DBAPI.domain.PlatformCaptureRecord[],
      [{ cnt: number }],
    ]
    type GetTrackQueryRes = API_DBAPI.domain.TrackPoint[]

    type getCitySituationUavTrack = API_DBAPI.domain.RIDUavData[]
  }
}
