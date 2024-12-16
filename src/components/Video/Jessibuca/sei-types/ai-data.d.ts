interface DisplayMeta {
  displayText: string
}

interface FrameTensor {
  layerName: string
  dims: string
  tensor: number[]
}

interface ObjLabel {
  inferId: number
  labelConfidence: number
  labelId: number
  labelValue: string
}

interface ObjTensor {
  layerName: string
  dims: string
  tensor: number[]
}

interface ObjPayload {
  payload: number[]
}

export interface Object {
  bboxHeight: number
  bboxLeft: number
  bboxTop: number
  bboxWidth: number
  classId: number
  confidence: number
  imagePath: string
  inferId: number
  objLabelList: ObjLabel[]
  objTensorList: ObjTensor[]
  objectId: string
  objectLabel: string
  objectSubLabel: string
  radarTargetId: number
  radarDeviceId: number
  videoTime: number
  speed: number
  distance: number
  yaw: number
  longitude: number
  latitude: number
  altitude: number
  sourceType: string
  objPayloadList: ObjPayload[]
  labelId: number
}

export interface AiObject extends Object {
  seq: number
  sourceFrameHeight: number
  sourceFrameWidth: number
}

export interface AIData {
  batchId: number
  frameMum: number
  displayMetaList: DisplayMeta[]
  frameTensorList: FrameTensor[]
  imagePath: string
  inferDone: number
  ntpTimestamp: number
  recordPath: string
  objectList: Object[]
  seq: number
  pts: number
  sourceFrameHeight: number
  sourceFrameWidth: number
  sourceId: string
  videoInferDone: boolean
  productKey: string
  deviceId: string
  videoPath: string
  ref: boolean
  userMeta: string
}
