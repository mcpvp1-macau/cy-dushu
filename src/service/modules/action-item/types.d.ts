declare namespace API_ACTION_ITEM {
  // ----------------- domain ----------------
  namespace domain {
    interface ActionItem {
      /* 用户列表,多个用逗号分隔 */
      acceptUserIds?: string
      /* 行动id */
      actionId?: number
      /* 子任务名称 */
      actionItemName?: string
      /* 行动任务记录列表 */
      actionItemRecordList?: ActionItemRecordList[]
      /* 子行动任务类型,SMART:智能任务,NO_SMART:非智能任务 */
      actionType?: string
      /* 任务描述 */
      description?: string
      /**
       * 设备id,多个用逗号分隔
       */
      deviceId?: string
      /**
       * 设备名称
       */
      deviceName?: string
      /**
       * 设备类型
       */
      deviceType?: string
      /**
       * 结束时间
       */
      endTime?: string
      /**
       * 创建时间
       */
      gmtCreate?: string
      /**
       * 创建者
       */
      gmtCreateBy?: string
      /**
       * 修改时间
       */
      gmtModified?: string
      /**
       * 修改者
       */
      gmtModifiedBy?: string
      /**
       * 主键
       */
      id: number
      /**
       * takserver任务名称
       */
      missionName?: string
      /**
       * 覆盖uuid列表,多个用逗号分隔
       */
      overlayUuids?: string
      /**
       * 开始时间
       */
      startTime?: string
      /**
       * 子任务状态，PENDING：未开始,PROCESSING：行动中，FINISH：已完成
       */
      status?: string
      /**
       * 行动任务配置信息(json字符串)
       */
      taskTemplateInfo?: string
      /**
       * 子任务模版id
       */
      taskTplId?: string
      [property: string]: any
    }
  }
  // ------------------ req ------------------
  namespace req {
    interface ActionItemListReq {
      /**
       * 大行动任务id
       */
      actionId: string
      /**
       * 大行动记录id
       */
      actionRecordId?: string
      /**
       * 是否分页
       */
      isPage?: boolean
      /**
       * 页码
       */
      page?: number
      /**
       * 每页数量
       */
      size?: number
      [property: string]: any
    }
    interface PauseActionItemReq {
      /**
       * 行动id
       */
      actionItemId?: number
      /**
       * 是否暂停 true 暂停 false 恢复
       */
      isPause?: boolean
    }
  }
  // ------------------ res ------------------
  namespace res {
    interface ActionItemListRes {
      rows: API_ACTION_ITEM.domain.ActionItem[]
      total: number
    }
  }
}
