declare namespace API_ACTION_PLAN {
  // ----------------- domain ----------------
  namespace domain {
    interface Plan {
      /**
       * json对象 计划的配置暂时未定结构 航线id选择的设备放在这个里面
       */
      actionConfig?: Record<string, any>
      /**
       * 计划描述
       */
      description?: string
      /**
       * 计划结束时间
       */
      endTime?: string
      /**
       * 执行时间
       * 14:00:00
       */
      executeTime?: string[]
      gmtCreate?: string
      gmtCreateBy?: string
      gmtModified?: string
      gmtModifiedBy?: string
      /**
       * 主键
       */
      id?: number
      /**
       * YES,NO 是否启用
       */
      isValid?: 'YES' | 'NO'
      /**
       * 计划名称
       */
      name?: string
      /**
       * 计划开始时间
       */
      startTime?: string
      /**
       * 状态
       */
      status?: string
      /**
       * 计划类型  单次、重复。。。
       *
       * SINGLE REPEAT
       */
      type?: string
      cycleType?: string
      dayOfMonth?: string
      dayOfWeek?: string
      intervalValue?: number
      [property: string]: any
    }
    interface PlanRecord {
      /**
       * 行动id
       */
      actionId: number
      /**
       * 行动名称
       */
      actionName?: string
      /**
       * 计划id
       */
      actionPlanName?: string
      /**
       * 设备名称
       */
      deviceName?: string
      /**
       * 计划结束时间
       */
      endTime?: string
      gmtCreate?: string
      gmtModified?: string
      /**
       * 主键
       */
      id?: number
      /**
       * 航线或各种任务的jobId
       */
      jobId?: string
      /**
       * 执行信息列表
       */
      message?: string
      /**
       * 计划开始时间
       */
      startTime?: string
      /**
       * 执行状态
       * 执行中、 PROCESSING
       * 执行中断、TERMINATE
       * 执行失败、FAILED
       * 执行成功、FINISH
       * 未执行 PENDING
       */
      status?: string
      [property: string]: any
    }
  }
  // ------------------ req ------------------
  namespace req {
    type GetPlanRecordListReq = API_COMMON.PageParam &
      Partial<{
        actionPlanId: number
        status: string
        startTime: string
        endTime: string
      }>
  }
  // ------------------ res ------------------
  namespace res {
    type GetPlanListRes = API_COMMON.PageRes<API_ACTION_PLAN.domain.Plan>
    type GetPlanRecordListRes =
      API_COMMON.PageRes<API_ACTION_PLAN.domain.PlanRecord>
  }
}
