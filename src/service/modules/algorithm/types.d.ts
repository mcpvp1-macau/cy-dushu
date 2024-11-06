declare namespace API_Alogrithm {
  // ----------------- domain ----------------
  namespace domain {
    interface AlgorithmRecord {
      id: number
      name: string
      createTime: string
      detectTargetList: string[]
      status: string
      deviceCount: number
      modelName: string
      deviceType: string[]
      deployRecordList: any[]
      paramList: any[]
      envMap: string
      imageType: string
      algorithmConfig: Record<string, any>
      algorithmConfigList: API_Alogrithm.domain.AlgorithmConfigItem[]
      [key: string]: any
    }
    interface AlgorithmConfigItem {
      id: number
      nodeSubtypeName: string
      nodeSubtype: string
      property: string
      propertyName: string
      /* text:文本,number:数字,checkbox:多选框,select:单选框,radio:单选 */
      valueType: string
      valueDefault?: any
      valueTip?: string
      valueEnums?: any
      valueUnit?: any
      valueMin?: any
      valueMax?: any
      valueStep?: any
      required?: boolean
      gmtCreate?: string
      gmtModified?: string
      gmtCreateBy?: any
      gmtModifiedBy?: any
    }
  }
  // ------------------ req ------------------
  namespace req {
    interface GetAlgorithmlistReq {
      deviceId?: string
      deviceType?: string[]
    }
    interface DeployAlgorithmReq {
      appId: number
      clusterId: string
      clusterPosition?: 'CENTER' | 'REGION'
      productKey: string
    }
    interface ReleaseAlgorithmReq {
      deployRecordId: number
      clusterId: string
      productKey: string
    }
  }
  // ------------------ res ------------------
  namespace res {
    interface GetAlgorithmlistRes {
      rows: API_LAYER_OVERLAY.domain.AlgorithmRecord[]
      total: number
    }
  }
}
