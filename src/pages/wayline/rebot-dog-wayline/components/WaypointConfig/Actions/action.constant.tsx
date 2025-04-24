import DeviceIconRebotDog from '@/assets/icons/jsx/device/DeviceIconRebotDog'
import IconCamera from '@/assets/icons/jsx/IconCamera'
import { QuestionCircleOutlined } from '@ant-design/icons'

export type ActionConfigType = {
  actionName: string
  config: any
  type: string
  key: string
  [k: string]: any
}

// 该 Enum 与 后端的 actionType 不一致
export enum ActionTypeEnum {
  /** 悬停 */
  HOVER,
  /** 拍照 */
  GET_PICTURE,
}

export const actionMap = new Map<ActionTypeEnum, ActionConfigType>([
  [
    ActionTypeEnum.HOVER,
    {
      key: 'HOVER',
      actionName: '悬停',
      config: {
        hoverTime: 10,
      },
      type: 'HOVER',
    },
  ],
  [
    ActionTypeEnum.GET_PICTURE,
    {
      key: 'GET_PICTURE',
      actionName: '拍照',
      config: {
        payloadLensIndex: [],
        useGlobalPayloadLensIndex: 1, // 是否跟随全局设置
      },
      type: 'GET_PICTURE',
    },
  ],
])

export const iconMap = new Map<ActionTypeEnum, React.ReactNode>([
  [ActionTypeEnum.HOVER, <DeviceIconRebotDog />],
  [ActionTypeEnum.GET_PICTURE, <IconCamera />],
])

export const actionKeys = Array.from(actionMap.keys())

export const getIcon = (action: any) => {
  if (!action) return
  if (action.type === 'HOVER') {
    return <DeviceIconRebotDog />
  }
  if (action?.type === 'GET_PICTURE') {
    return <IconCamera />
  }
  return <QuestionCircleOutlined />
}
