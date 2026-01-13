declare namespace API_AIRLINE {
  // ----------------- domain ----------------
  namespace domain {
    interface AIRLINE_TEMPLATE {
      username: string
      templateId: string
      taskName: string
      taskType: string
      productKey: string
      taskTemplateFileUrl: string
      gmtCreate: string
      gmtModified: string
      gmtCreateBy: string
      gmtCreateByName?: string
      gmtModifiedBy: string
      waylineTemplateId: number
      folderId?: number
      /** JSON */
      taskBasic: string
      /** JSON */
      parameters: string
      isTemplate?: 'YES' | 'NO'
      isThird?: 'YES' | 'NO'
    }
    interface Model {
      modelName: string
      cameras: Camera[]
    }
    interface Camera {
      id: number
      cameraKey: number
      cameraName: string
      defaultParam: string
      parentId: number
    }
    /** 航线文件夹树节点 */
    interface WaylineFolderTreeNode {
      id: number
      parentId: number
      folderName: string
      gmtCreate: string
      gmtModified: string
      gmtCreateBy: string
      gmtModifiedBy: string
      children: WaylineFolderTreeNode[]
    }
  }
  // ------------------ req ------------------
  namespace req {
    /** 航线模板列表请求参数 */
    interface ListFlightTaskTemplateRequest extends API_COMMON.PageParam {
      productKey?: string
      templateName?: string
      taskType?: string
      waylineTemplateId?: string
      templateId?: string
      folderId?: string
    }
    /** 创建航线文件夹请求参数 */
    interface CreateWaylineFolderRequest {
      parentId?: number
      folderName: string
    }
    /** 查询航线文件夹列表请求参数 */
    interface ListWaylineFolderRequest {
      folderName?: string
    }
    /** 删除航线文件夹请求参数 */
    interface DeleteWaylineFolderRequest {
      folderId: number
    }
  }
  // ------------------ res ------------------
  namespace res {
    type GetAirlineTemplateListRes =
      API_COMMON.PageRes<API_AIRLINE.domain.AIRLINE_TEMPLATE>
    type getWaylineTaskModelRes = API_AIRLINE.domain.Model[]
    /** 创建航线文件夹响应 */
    interface CreateWaylineFolderResponse {
      folderId: number
    }
    /** 查询航线文件夹列表响应 */
    type ListWaylineFolderResponse = API_AIRLINE.domain.WaylineFolderTreeNode[]
  }
}
