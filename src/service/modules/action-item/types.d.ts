declare namespace API_ACTION_ITEM {
  // ----------------- domain ----------------
  namespace domain {
    interface TaskTemplateInfo {
      smartTaskType?: string
      defaultDeviceId?: string
      defaultDeviceName?: string
      taskBasic?: string
      parameters?: Record<string, any>
      takeOffSecurityHeight?: number
      globalRTHHeight?: number
    }

    interface ActionItemDetail {
      actionItemId?: number
      taskId?: string
      actionId?: number
      deviceType?: string
      deviceId?: string
      taskTemplateInfo?: TaskTemplateInfo
      actionItemName?: string
      status?: string
      startTime?: string
      endTime?: string
      templateId?: string
      actionPlanId?: number
      actionPlanName?: string
    }

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
       * 断点 ID
       */
      breakPointId?: number
      /**
       * 接力飞行设备的ID
       */
      relayDeviceId?: string
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
      /**
       * 飞行高度
       */
      flightHeight?: number
      /**
       * 返航高度
       */
      returnHeight?: number
      [property: string]: any
    }

    interface PilotInfo {
      /**
       * 飞手名称
       */
      name?: string
      /**
       * 组织Code
       */
      orgCode?: string
      /**
       * 组织名称
       */
      orgName?: string
      /**
       * 飞手id
       */
      userCode?: string
    }

    /**
     * 飞手组织树查询列表
     *
     * PilotTree
     */
    interface PilotTree {
      /**
       * 下级单位列表
       */
      children: PilotTree[]
      /**
       * 单位名称
       */
      name: string
      /**
       * 单位编号
       */
      orgCode: string
      /**
       * 父单位编码
       */
      parentCode: string
      /**
       * 飞手列表
       */
      pilots: PilotInfo[]
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
    interface AddActionItemRes {
      gmtModified: string
      gmtCreateBy: string
      gmtModifiedBy: string
      isValid: string
      productKey: string
      templateId: string
      gmtCreate: string
      taskBasic: string
      taskType: string
      isTemplate: string
      taskTemplateFileUrl: string
      taskName: string
      id: number
      parameters: string
    }

    interface GetPilotTreeRes {
      rows: API_ACTION_ITEM.domain.PilotTree[]
      total: number
    }
  }
}
