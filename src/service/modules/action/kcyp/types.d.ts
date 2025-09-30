declare namespace API_KCYP {
  // ----------------- domain ----------------
  namespace domain {
    interface OrderRecord {
      /**
       * 事故类型
       */
      accidentType?: string
      /**
       * 报案方受损部位
       */
      brokenPart?: string
      /**
       * 报案方车牌颜色
       */
      carColor?: string
      /**
       * 报案方证件号
       */
      cardNo?: string
      /**
       * 报案方车牌号
       */
      carNo?: string
      /**
       * 报案方车类型
       */
      carType?: string
      /**
       * 事故发生地点
       */
      caseHapAddress?: string
      /**
       * 事故发生时间
       */
      caseHapTime?: string
      /**
       * 主键
       */
      caseId?: string
      /**
       * 提交时间
       */
      commitTime?: string
      /**
       * 报案方驾驶员
       */
      driverName?: string
      /**
       * 是否为第一现场
       */
      firstScene?: string
      /**
       * 创建时间
       */
      gmtCreate?: string
      /**
       * 创建人
       */
      gmtCreateBy?: string
      /**
       * 修改时间
       */
      gmtModified?: string
      /**
       * 修改人
       */
      gmtModifiedBy?: string
      /**
       * 主键
       */
      id?: number
      /**
       * 报案方证件类型
       */
      idType?: string
      /**
       * 事故发生点纬度
       */
      latitude?: number
      /**
       * 事故发生点经度
       */
      longitude?: number
      /**
       * 另一方受损部位
       */
      otherBrokenPart?: string
      /**
       * 另一方车牌颜色
       */
      otherCarColor?: string
      /**
       * 另一方报案证件号
       */
      otherCardNo?: string
      /**
       * 另一方车牌号
       */
      otherCarNo?: string
      /**
       * 另一方车类型
       */
      otherCarType?: string
      /**
       * 另一方驾驶员
       */
      otherDriverName?: string
      /**
       * 另一方证件类型
       */
      otherIdType?: string
      /**
       * 另一方手机号
       */
      otherPhone?: string
      /**
       * 报案方手机号
       */
      phone?: string
      /**
       * 处理结果
       */
      processResult?: string
      /**
       * 处理状态
       */
      processStatus?: ProcessStatus
      /** 扩展 JSON 字段 */
      extra?: string
      [property: string]: any
    }
    interface Picture {
      /**
       * 车牌颜色
       */
      carColor?: string
      /**
       * 车牌号
       */
      carNo?: string
      /**
       * 检测结果ID
       */
      id?: number
      /**
       * 照片类型
       */
      imageType?: string
      /**
       * 图片拍摄纬度
       */
      latitude?: number
      /**
       * 图片拍摄经度
       */
      longitude?: number
      /**
       * 图片地址
       */
      pictureUrl?: string
      [property: string]: any
    }
    interface CommitResultRecord {
      type:
        | 'CAR_NO_CHECK'
        | 'OTHER_CAR_NO_CHECK'
        | 'CARD_CHECK'
        | 'OTHER_CARD_CHECK'
      success: boolean
      message: string
    }

    interface ZSOrderRecord {
      processResult: number
      caseId: string
      policeInformationId: string
      dept: string
      longitude: number
      latitude: number
      caseHapTime: string // 时间格式 "YYYY-MM-DD HH:mm:ss"
      caseHapAddress: string
      accidentFrom: string
      accidentType: string
      accidCollision: string
      carNo: string
      phone: string
      driverName: string
      carType: string
      cardNo: string
      idType: string
      processStatus: string
      commitTime: string
      gmtCreate: string
      gmtModified: string
      gmtCreateBy: string | null
      gmtModifiedBy: string | null
      ocarNo: string
      oidType: string
      ophone: string
      ocardNo: string
      odriverName: string
      ocarType: string
    }

    interface ZSPicture {
      id: number
      pictureUrl: string
      longitude: number
      latitude: number
      carNo: string
      carColor: string
      imageType: string
    }

    interface ZSCasePictures {
      caseId: string
      policeNumber: string
      pictures: ZSPicture[]
    }
  }
  // ------------------ req ------------------
  namespace req {
    interface GetKCYPOrderReq {
      caseId: string
    }
    type SaveKYCPOrderReq = OrderRecord
    interface CommitKCYPReq {
      kcypActionCommit: OrderRecord
      pictures: Picture[]
    }

    interface GetSipCascadePictureReq {
      actionId: number
      actionItemId: number
      actionItemRecordId: number
      actionRecordId: number
      deviceId: string
      plateNo: string
      resultTime: string
    }
  }
  // ------------------ res ------------------
  namespace res {
    type GetKCYPOrderRes = API_KCYP.domain.OrderRecord
    type CommitKCYPRes = API_KCYP.domain.CommitResultRecord[]
    type CheckNoRes = {
      carNos?: {
        carNo?: string
        message?: string
        success?: boolean
        [property: string]: any
      }[]
    }
  }
}
