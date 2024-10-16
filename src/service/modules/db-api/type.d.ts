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
  }
}
