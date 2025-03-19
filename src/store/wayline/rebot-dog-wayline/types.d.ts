export type RebotDogWaylineConfigType = {
  speed: number
}

export type TakePhotoActionType = {
  type: 'GET_PICTURE'
  config: {}
}

export type RebotDogActionType = TakePhotoActionType

export type RebotDogWaypointConfigType = {
  positionIndex: number
  positionName: string
  actions: ActionType[]
  pointX: number
  pointY: number
  pointZ: number
  xid: string
}
