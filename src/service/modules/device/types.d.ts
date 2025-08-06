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
      deviceModel: DeviceModel
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

    // type dType =
    //   | 'struct'
    //   | 'int'
    //   | 'text'
    //   | 'float'
    //   | 'double'
    //   | 'bool'
    //   | 'enum'
    //   | 'array'

    interface NumberSpecs {
      max: number
      min: number
      step: number
      unit?: string
      unitName?: string
    }

    interface TextSpecs {
      length: number
    }

    interface EnumSpec {
      [key: string | number]: string
    }

    interface BooleanSpec {
      0: string
      1: string
    }

    type StructSpec = {
      paramName: string
      identifier: string
      name: string
    } & DataType

    type BaseType =
      | {
          type: 'int' | 'float' | 'double'
          specs: NumberSpecs
        }
      | {
          type: 'text'
          specs: TextSpecs
        }
      | {
          type: 'enum'
          specs: EnumSpec[]
        }
      | {
          type: 'bool'
          specs: BooleanSpec
        }
      | {
          type: 'struct'
          specs: StructSpec[]
        }

    type Rename<T, K extends string, V extends string> = {
      [P in keyof T as P extends K ? V : P]: T[P]
    }

    type ArrayItemSpec = Rename<BaseType, 'type', 'dataType'>

    type DataType =
      | BaseType
      | {
          type: 'array'
          specs: {
            size: number
          }
          item: ArrayItemSpec
        }

    type expandsType = {
      show?: boolean
    }

    type Field = {
      dataType: DataType
      id: number
      identifier: string
      name: string
      required: boolean
    }

    interface Event {
      desc: string
      identifier: string
      inputMethodFields: Field[]
      method: string
      name: string
      outputMethodFields: Field[]
    }

    interface Events {
      [identifier: string]: Event
    }

    interface Service {
      callType: 'sync' | 'async'
      desc: string
      expands: expandsType
      identifier: string
      inputMethodFields: Field[]
      method: string
      name: string
      outputMethodFields: any[]
    }

    interface Services {
      [identifier: string]: Service
    }

    interface Propertie {
      dataType: DataType
      desc: string
      expands: expandsType
      id: number
      identifier: string
      name: string
      required: boolean
    }

    interface DeviceModel {
      configs: Propertie[]
      deviceId: string
      events: Events
      name: string
      productKey: string
      productType: string
      productVersion: string
      properties: Propertie[]
      services: Services
    }
    interface Device {
      name: string
      productKey: string
      deviceId: string
      deviceName: string
      longitude?: number
      latitude?: number
      altitude?: number
      status: string
      taskStatus: string
      sn: string
      remainingPower: number
      createTime: number
      deviceType: string
      /** 地图id 以前给机器狗用的 */
      spaceId: string
      deviceRegisterVersion: string
      deviceTags: {
        tagName: string
        tagValue: string
      }[]
      properties: API_DEVICE.domain.Properties
      childrenDevices?: any[]
      childDevice?: Device[]
      parentId: string
      subDevice: boolean
      deviceModel: DeviceModel
      videos?: {
        name: string
        videoId: string
        videoTypes: any[]
      }[]
      /** 望楼转台独有的 */
      pitch?: number
      /** 望楼转台独有的 */
      yaw?: number
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
    interface UavDocDetail {
      /**
       * 安装地址
       */
      address?: string
      /**
       * 行政区划
       */
      administrativeDivision?: string
      /**
       * 建设应用类别
       */
      buildType?: string
      /**
       * 摄像机类型
       */
      cameraType?: string
      /**
       * 对应存储设备通道
       */
      deviceChannel?: string
      /**
       * 设备名称
       */
      deviceName?: string
      /**
       * 设备型号
       */
      deviceType?: string
      /**
       * 出入方向
       */
      direction?: string
      /**
       * 设备编码
       */
      gbId?: string
      /**
       * 安装高度（单位米）
       */
      height?: string
      /**
       * 主键ID
       */
      id?: number
      /**
       * 安装时间
       */
      installTime?: string
      /**
       * IPV4地址
       */
      ip?: string
      /**
       * 是否对外共享
       */
      isShare?: string
      /**
       * 是否接入三级平台
       */
      isThird?: string
      /**
       * 键盘编号
       */
      keyNumber?: string
      /**
       * 纬度
       */
      latitude?: string
      /**
       * 定位模块
       */
      locationMode?: string
      /**
       * 经度
       */
      longitude?: string
      /**
       * 设备厂商
       */
      manufacturer?: string
      /**
       * 监视方向
       */
      monitorDirection?: string
      /**
       * 监控点类型
       */
      monitorPointType?: string
      /**
       * 点位俗称
       */
      nickName?: string
      /**
       * 场所名称
       */
      placeName?: string
      /**
       * 场所编号
       */
      placeNumber?: string
      /**
       * 摄像机位置类型
       */
      positionType?: string
      /**
       * 所属辖区公安机关
       */
      publicSecurityBureau?: string
      /**
       * 遥控器编码
       */
      rcSn?: string
      /**
       * 录像或图片保存天数
       */
      recordDays?: string
      /**
       * 对应存储设备IP
       */
      recordIp?: string
      /**
       * 分辨率
       */
      resolution?: string
      /**
       * 部位类型
       */
      sectionType?: string
      /**
       * 视频信号类型
       */
      signalType?: string
      /**
       * SN码
       */
      sn?: string
      /**
       * 设备状态
       */
      status?: string
      /**
       * 管理单位
       */
      unit?: string
      /**
       * 管理单位联系方式
       */
      unitContact?: string
      /**
       * 可视距离（单位米）
       */
      visibleDistance?: string
      [property: string]: any
    }

    type DjiOtaInfo = {
      deviceSn: string
      deviceName: string
      deviceId: string
      firmwareVersion: string
      firmwareVersionName: string
      latestFirmwareVersion: string
      djiOtaStatus: 'NO_UPGRADE' | 'UPGRADE' | 'UPGRADING' | 'ALL'
    }
    type DeviceOTAItem = DeviceListItem & {
      djiOtaInfo: DjiOtaInfo
      ttpBoxSn: string
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
        sn: string
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
    type GetUavDocDetailRes = API_DEVICE.domain.UavDocDetail
    type AllDeviceListV3OTARes =
      API_COMMON.PageRes<API_DEVICE.domain.DeviceOTAItem>
  }
}
