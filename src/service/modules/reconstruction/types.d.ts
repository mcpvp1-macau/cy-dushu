declare namespace API_RECONSTRUCTION {
  interface LayerGroup {
    id: number
    layerName: string //分组名称
    createTime: number
    layerUuid: string
    layerType: 'DEFAULT' | 'NORMAL'
    gmtCreate: string
    gmtCreateBy: string
    gmtModified: string
    gmtModifiedBy: string
  }

  interface Layer {
    layerId: number
    overlayId: number
    overlayName: string
    overlayType: string
    overlayPositions: string
    overlayBindType: string
    overlayUuid: string
    overlayStyleConfig: string
    hide: number
    cotType: string
    gmtCreate: string
    gmtCreateBy: string
    name: string
    createUid: string
    useTime: number
    imagesCount: number
    modelLayerLon: number
    modelLayerLat: number
    modelLayerHeight: number
    cameraHeading: number
    cameraPitch: number
    cameraRoll: number
    modelPath: string
    status: 'PENDING' | 'PROCESSING' | 'FINISHED' | 'PAUSE'
    imagesFolderPath: string
  }

  namespace req {
    type GetLayerList = {
      layerIds: number[]
      deviceId?: string
    }

    type CreateLayer = {
      layerId?: number //非必填
      overlayName?: string //非必填
      /**范围类型，示例：POLYGON */
      overlayType: string
      /**范围，示例：[[116.317447,38.291992],[117.0413,37.865668],[117.026106,37.852659],[117.026106,37.852659]] */
      overlayPositions?: string
      overlayBindType: string
      overlayStyleConfig: string
      cotType: string
    }

    type UpdateLayer = {
      overlayId: number
      overlayName: string
      layerId: number
    }

    type StartTask = {
      overlayId: number
      deviceId?: string
      //飞行参数
      flightAltitude?: number //飞行高度
      returnAltitude?: number //返航高度
      taskCompletionAction?: 'GO_HOME' | 'HOVER' //任务完成动作 返航：GO_HONE 悬停：HOVER
      /**是否是通过飞行进行重建 */
      needFly?: boolean
    }

    type StartBuild = {
      taskId: number
      bucket: string
      minioPath: string
    }
  }

  namespace res {
    type LayerGroupList = LayerGroup[]
    type LayerList = Layer[]
    type BuildResult = {
      code: string
      message: string
      data: any
      requestId: string
      success: boolean
    }
  }
}
