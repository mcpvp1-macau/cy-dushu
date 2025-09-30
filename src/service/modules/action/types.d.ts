declare namespace API_ACTION {
  // ----------------- domain ----------------
  namespace domain {
    interface ActionRecord {
      id: number
      actionId: number
      name: string
      status: string
      eventId: string
      startTime: string
      type: string
      endTime: string
      gmtCreate: string
      gmtModified: string
      gmtCreateBy: string
      gmtModifiedBy: string
      description: string
    }
    interface ActionDetail {
      id: number
      name: string
      description: any
      eventId: any
      type:
        | 'normal'
        | 'kcyp_action'
        | 'xiaoshan_kcyp_action'
        | 'ewjt_action'
        | 'zs_kcyp_action'
        | 'biwu_action'
      status: string
      isValid: any
      gmtCreate: string
      gmtModified: string
      gmtCreateBy: string
      gmtModifiedBy: string
      actionRecordId: any
      userList: Record<string, any>[]
    }
    interface AIResultRecord {
      id: string
      actionId: number
      actionItemId: number
      actionRecordId: number
      actionItemRecordId: number
      plateNo: string
      plateColor: string
      plateType: string
      source: string
      longitude: number
      latitude: number
      resultType: string
      level: string
      deviceId: string
      resultTime: string
      gmtCreate: string
      gmtModified: string
      deleted: number
      isSend: number
      image: string
      sourceImage: string
      leftTopX: number
      leftTopY: number
      rightBtmX: number
      rightBtmY: number
      bboxWidth: number
      bboxHeight: number
      sourceFrameWidth: number
      sourceFrameHeight: number
      confidence: number
      deviceType: any
      gmtCreateBy: any
      gmtModifiedBy: any
      deviceName: string
      objListJson: any
      extra?: string | null
    }
  }
  // ------------------ req ------------------
  namespace req {
    type ActionListReq = API_COMMON.PageParam & {
      name?: string
      type?: string
      startTime?: string
      endTime?: string
      status?: string[]
    }
  }
  // ------------------ res ------------------
  namespace res {
    interface ActionListRes {
      rows: API_ACTION.domain.ActionRecord[]
      total: number
    }
    type ActionDetailRes = API_ACTION.domain.ActionDetail
    interface AIResultListRes {
      rows: API_ACTION.domain.AIResultRecord[]
      total: number
    }
  }
}
