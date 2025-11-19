import mitt from 'mitt'

export type TargetAppearanceStatus = 'APPEARANCE' | 'LOST'

export type TargetAppearancePayload = {
  /** 目标ID */
  objectId: string
  /** 目标状态，APPEARANCE 表示出现，LOST 表示消失 */
  status: TargetAppearanceStatus
}

type ControlRoomUavEvents = {
  targetAppearance: TargetAppearancePayload
}

export const controlRoomUavEmitter = mitt<ControlRoomUavEvents>()
