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
      gmtModifiedBy: string
      waylineTemplateId: number
      /** JSON */
      taskBasic: string
      /** JSON */
      parameters: string
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
  }
  // ------------------ req ------------------
  namespace req {}
  // ------------------ res ------------------
  namespace res {
    type GetAirlineTemplateListRes =
      API_COMMON.PageRes<API_AIRLINE.domain.AIRLINE_TEMPLATE>
    type getWaylineTaskModelRes = API_AIRLINE.domain.Model[]
  }
}
