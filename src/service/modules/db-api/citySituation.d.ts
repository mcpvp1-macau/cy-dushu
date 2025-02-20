declare namespace API_DBAPI {
  // ----------------- domain ----------------
  namespace domain {
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
  }
  // ------------------ req ------------------
  namespace req {}
  // ------------------ res ------------------
  namespace res {
    type GetCitySituationUavDetail = {
      /** 无人机基本信息 */
      uavInfo: domain.UavInfo[]
      /** 飞行员基本信息 */
      pilotInfo: domain.PilotInfo[]
      /** 控制站基本信息 */
      controlStationInfo: domain.ControlStationInfo[]
    }
  }
}
