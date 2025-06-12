export type WaylineTemplateType = Partial<{
  waylineTemplateId: number
  taskName: string
  templateId: string
  smartTaskType: string
  defaultDeviceId: string
  pilotCode: string
  actionId: string
  deviceId: string
  [key: string]: any
}>

/** 航线配置 */
export type AirlineConfigType = {
  flyToWaylineMode: string
  imageFormat: string[]
  height: number
  speed: number
  globalRTHHeight: number
  globalTransitionalSpeed: number
  takeOffRefPoint: number[] | null
  globalWaypointTurnMode: string
  waypointHeadingMode: string
  gimbalPitchMode: string
  finishAction: string
  roadNetworkMode?: boolean
  roadNetworkTargetPosition?: number[]
  [key: string]: any
}

/** 航点配置 */
export type AirlinePoint = {
  positionIndex: number
  positionName: string
  actions: ActionType[]
  pointX: number
  pointY: number
  pointZ: number
  uavHeading?: number
  eoHeading?: number
  eoPitch?: number
  eoRoll?: number
  eoFovMultiplier?: number
  [key: string]: any
}

/** 悬浮 */
export type ActionHoverType = {
  type: 'HOVER'
  config: { hoverTime: number }
}

/** 飞行器偏航角 */
export type ActionRotateYawType = {
  type: 'ROTATE_YAW'
  config: { aircraftHeading: number }
}

/** 云台偏航&俯仰角 */
export type ActionCameraPositionType = {
  type: 'CAMERA_POSITION'
  config: { x?: number; y?: number; roll?: number }
}

/** 相机变焦 */
export type ActionCameraZoomType = {
  type: 'ZOOM'
  config: { focalLength: number }
}

/** 拍照 */
export type ActionGetPictureType = {
  type: 'GET_PICTURE'
  config: { payloadLensIndex: string[]; useGlobalPayloadLensIndex: number }
}

/** 镜头切换 */
export type ActionLensChangeType = {
  type: 'LEN_CHANGE'
  config: { actionTiming: 'ARRIVE' | 'LEAVE'; videoType: string }
}

/** 开启算法 */
export type ActionOpenAIType = {
  type: 'OPEN_AI'
  config: {
    algorithmId: number
    actionTiming: 'ARRIVE' | 'LEAVE'
    algorithmConfig: Record<string, any>
    algorithmData?: Record<string, any>
  }
}

/** 关闭算法 */
export type ActionCloseAIType = {
  type: 'CLOSE_AI'
  config: {
    algorithmId: number
    actionTiming: 'ARRIVE' | 'LEAVE'
  }
}

export type ActionUnknownType = {
  type: 'UNKNOWN'
  config: unknown
}

/** 航点动作配置 */
export type ActionType = (
  | ActionHoverType
  | ActionRotateYawType
  | ActionCameraPositionType
  | ActionCameraZoomType
  | ActionGetPictureType
  | ActionLensChangeType
  | ActionOpenAIType
  | ActionCloseAIType
  | ActionUnknownType
) & {
  xid: string
}

type AirpointsConfigItem = AirlinePoint & {
  xid: string
}
