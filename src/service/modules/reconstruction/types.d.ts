declare namespace API_RECONSTRUCTION {
  interface LayerGroup {
    layerId: number
    layerName: string //分组名称
    createTime: number
    layerUuid: string
    layerType: 'DEFAULT' | 'NORMAL'
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
    cameraPitchv: number
    cameraRoll: number
    modelPath: string
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
      overlayPositions: string
      overlayBindType: string
      overlayStyleConfig: string
      cotType: string
    }

    type UpdateLayer = {
      overlayId: number
      overlayName: string
    }

    type StartTask = {
      overlayId: number
      deviceId: string
      //飞行参数
      flightAltitude: number //飞行高度
      overlapRate: number //重叠率
      returnAltitude: number //返航高度
      taskCompletionAction: 'goBack' | 'hover' //任务完成动作 返航：goBack 悬停：hover
    }
  }

  namespace res {
    type LayerGroupList = API_COMMON.PageRes<LayerGroup>
    type LayerList = API_COMMON.PageRes<Layer>
  }
}
