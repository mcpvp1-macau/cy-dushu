declare namespace API_DEVICE {
  // ----------------- domain ----------------
  namespace domain {
    interface DeviceType {
      markerIcon: string
      name: string
      icon: string
      type: string
      productKey: string
    }
    interface DeviceListItem {
      productKey: string
      deviceId: string
      deviceModel: any
      deviceName: string
      deviceRegisterVersion: string
      deviceType: string
      latitude: number
      longitude: number
      remainingPower: number
      sn: string
      spaceId: string
      status: string
      taskStatus: string
      createTime: number
      username: string
      otaInfo?: OTAInfo
    }
    interface Device {
      name: string
      productKey: string
      deviceId: string
      deviceName: string
      longitude?: number
      latitude?: number
      status: string
      taskStatus: string
      sn: string
      remainingPower: number
      createTime: number
      deviceType: string
      spaceId: string
      deviceRegisterVersion: string
      deviceTags: {
        tagName: string
        tagValue: string
      }[]
      properties: API_DEVICE.domain.Properties
      childrenDevices?: any[]
      childDevice?: any[]
      parentId: string
      subDevice: boolean
      deviceModel?: any
    }
    type Properties = Partial<{
      HorizontalAvoidEnable: string
      altitude: number
      ar: boolean
      attitudeHead: number
      autoPhotoStatus: string
      backAvoidDistance: number
      cameraMode: string
      controlDelay: number
      controlTag: string
      delayLimit: number
      disconnectTime: number
      displayMode: string
      downAvoidDistance: number
      downAvoidEnable: string
      downlinkBitrate: number
      electricity: number
      enableAI: string
      flightStatus: string
      flyDistance: number
      flyTime: number
      frontAvoidDistance: number
      gimbalHead: number
      gimbalMode: string
      gimbalPitch: number
      gimbalRoll: number
      gimbalType: string
      gimbalYaw: number
      gohomeAltitude: number
      gohomeLatitude: number
      gohomeLongitude: number
      healthInfo: Array<string>
      height: number
      hfov: number
      homeDistance: number
      horizontalSpeed: number
      laserAltitude: number
      laserDistance: number
      laserLatitude: number
      laserLongitude: number
      latitude: number
      leftAvoidDistance: number
      lensType: string
      longitude: number
      lostAction: string
      mac: string
      operator: string
      policyGroup: string
      rightAvoidDistance: number
      rsrp: number
      rtk: string
      satelliteNumber: number
      signalMode: string
      signalStrength: number
      sinr: number
      sn: string
      taskStatus: string
      uavPitch: number
      uavRoll: number
      uavYaw: number
      upAvoidDistance: number
      upAvoidEnable: string
      uplinkBitrate: number
      vfov: number
      videoList: Array<{
        index: number
        name: string
        sources: Array<{
          id: string
          name: string
          types: Array<{
            name: string
            type: string
          }>
        }>
        videoId: string
        videoTypes: Array<{
          name: string
          type: string
        }>
      }>
      videoSource: string
      waypointIndex: number
      zoomFactor: number
      [key: string]: any
    }>
    interface DeviceTreeItem {
      groupId: string
      groupName: string
      devices: Device[]
      children: DeviceTreeItem[]
    }
    interface OTAInfo {
      newVersion: boolean
      artifactName: string
      newVersionName: string
      status: string
      deploymentId: string
    }
    interface HistoryVideoListItem {
      playUrl: string
      timeRange: string[]
      previewUrl: string
      previewTimestamp: number
    }
    interface DeviceLink {
      name: string
      linkId: string
      active: boolean
      great: boolean
    }
  }
  // ------------------ req ------------------
  namespace req {
    type GetDeviceTreeReq = Partial<{
      name: string
      type: string
    }>
    type GetDeviceListReq = API_COMMON.PageParam &
      Partial<{
        otaInfo: boolean
        deviceName: string
        type: string
      }>
  }
  // ------------------ res ------------------
  namespace res {
    interface DeviceTypeListRes {
      rows: API_DEVICE.domain.DeviceType[]
      total: number
    }
    type DeviceTreeRes = API_DEVICE.domain.DeviceTreeItem
    type AllDeviceListRes = API_COMMON.PageRes<API_DEVICE.domain.DeviceListItem>
    type AllDeviceListV3Res = API_COMMON.PageRes<API_DEVICE.domain.Device>
    type DeviceDetailRes = API_DEVICE.domain.Device
    type GetHistoryListRes = {
      videoList: API_DEVICE.domain.HistoryVideoListItem[]
    }
    type GetDeviceLinkRes = { links: API_DEVICE.domain.DeviceLink[] }
  }
}
