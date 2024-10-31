declare namespace API_EVENTS {
  // ----------------- domain ----------------
  namespace domain {
    interface Event {
      id: number
      eventId: string
      eventNo: string
      eventName: string
      source: string
      longitude: number
      latitude: number
      eventType: string
      level: string
      deviceId: string
      processStatus: string
      parentEventId: any
      eventTime: string
      gmtCreate: string
      gmtModified: string
      deleted: number
      isSend: number
      leftTopX: any
      leftTopY: any
      rightBtmX: any
      rightBtmY: any
      bboxWidth: any
      bboxHeight: any
      image: any
      sourceImage: string
      planId: any
      itemName: any
      sourceFrameWidth: number
      sourceFrameHeight: number
      confidence: any
      startTime: any
      dispositionId: any
      imageUri: any
      isWarning: any
      gmtCreateBy: any
      gmtModifiedBy: any
      deviceName: string
      deviceType: any
      pointX: any
      pointY: any
      pointZ: any
      spaceType: any
      spaceId: any
      positionId: any
      positionName: string
      reason: any
      endTime: any
      sourceActionId: any
      targetId: any
      radarTargetId: any
      actionId: any
      orgCode: any
      objListJson: any
      objectList?: Array<{
        leftTopX?: number
        leftTopY?: number
        rightBtmX?: number
        rightBtmY?: number
        bboxWidth?: number
        bboxHeight?: number
        image: any
        sourceImage: string
        sourceFrameWidth: number
        sourceFrameHeight: number
        confidence: any
        eventTime: string
        dispositionImage: any
      }>
      speed: any
      distance: any
      recordPath: any
      altitude: any
      sourceType: string
      radarId: string
      expand: any
      subEventList: any
      shipInfo: any
      crewInfo: any
    }
    interface EventType {
      id: number
      eventType: string
      eventName: string
      showHistoryVideo: number
      showImage: number
      gmtCreate: string
      gmtModified: string
      deleted: number
      gmtCreateBy: any
      gmtModifiedBy: any
      level: string
      propertiesList: Array<{
        id: number
        eventType: string
        property: string
        propertyName: string
        valueType: string
        valueFormat?: string
        sort: number
        required: number
        gmtCreate: string
        gmtModified: string
        gmtCreateBy: any
        gmtModifiedBy: any
        deleted: number
      }>
    }
  }
  // ------------------ req ------------------
  namespace req {
    type GetEventListReq = API_COMMON.PageParam & {
      beginTime?: string
      endTime?: string
      eventName?: string
      eventType?: string
      processStatusList?: string[]
      eventLevelList?: string[]
      eventSourceList?: string[]
      eventTypeList?: string[]
    }
  }
  // ------------------ res ------------------
  namespace res {
    type GetEventListRes = API_COMMON.PageRes<API_EVENTS.domain.Event>
    type GetEventTypeListRes = API_COMMON.PageRes<API_EVENTS.domain.EventType>
    type GetEventTypeAndSourceListRes = {
      eventTypeList: Record<string, string>[]
      eventSourceList: Record<string, string>[]
    }
  }
}
