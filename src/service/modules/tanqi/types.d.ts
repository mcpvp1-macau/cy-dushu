declare namespace API_TANQI {
  namespace domain {
    /**
     * 表示一个对话任务的接口
     */
    interface DialogTask {
      /** 任务的唯一标识符 */
      id: number
      /** 对话名称，例如 "航线飞行任务01" */
      dialogName: string
      /** 创建时间，格式为 "YYYY-MM-DD HH:mm:ss"，例如 "2025-03-03 22:15:16" */
      gmtCreate: string
      /** 设备ID，通常为一串标识符，例如 "34123123123123123" */
      deviceId: string
      /** 动作ID，用于标识具体的动作 */
      actionId: number
      /**
       * 是否开启任务理解
       * - 0: 未开启
       * - 1: 已开启
       */
      taskUnderstanding: 0 | 1 | 2
    }
  }
  // ------------------ req ------------------
  namespace req {
    type GetDialogList = {
      deviceId: string
      actionId?: string
    }
    type NewDialogConfig = {
      /**
       * 设备ID，例如 "52321231"
       */
      deviceId: string
      productKey: string

      /**
       * 会话ID，例如 "52321231"
       */
      conversationId?: string

      /**
       * 对话名称，例如 "航线飞行任务01"
       */
      dialogName?: string

      /**
       * 是否开启任务理解
       * - 0: 关闭
       * - 1: 开始
       */
      taskUnderstanding?: 0 | 1 | 2
    }
    type UpdateDialog = {
      /**
       * 列表接口返回的ID字段，例如 1
       */
      id: number

      /**
       * 对话名称，例如 "航线飞行任务01"
       */
      dialogName?: string

      /**
       * - 0: 关闭
       * - 1: 任务理解
       * - 2: 指令控制
       * @remarks 只修改会话名称时该字段不要传
       */
      taskUnderstanding?: 0 | 1 | 2
    }
    type SendDialogMsg = {
      /**
       * 列表接口返回的ID字段，例如 1
       */
      id: number

      /**
       * 产品密钥，例如 "000000001"
       */
      productKey?: string

      /**
       * 设备ID，例如 "34123123123123123"
       * @optional 非必填
       */
      deviceId?: string

      /**
       * 行动ID，例如 123
       * @optional 非必填
       */
      actionId?: number

      /**
       * 对话唯一ID，例如 1
       */
      requestId?: number

      /**
       * 提示内容，例如 "帮我关注一下烟花燃放"
       */
      prompt: string
    }
  }
  // ------------------ res ------------------
  namespace res {
    type GetDialogList = API_TANQI.domain.DialogTask[]
  }
}
