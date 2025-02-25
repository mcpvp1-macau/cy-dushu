import WRJXT from '../icons/WRJXT'
import FXQPHJ from '../icons/FXQPHJ'
import YTPHJ from '../icons/YTPHJ'
import YTFYJ from '../icons/YTFYJ'
import XJBJ from '../icons/XJBJ'
import PZ from '../icons/PZ'
import IconCameraSwitch from '@/assets/icons/jsx/IconCameraSwitch'
import IconAIEnable from '@/assets/icons/jsx/IconAIEnable'
import IconAIDisable from '@/assets/icons/jsx/IconAIDisable'
import IconFocus from '@/assets/icons/jsx/IconFocus'

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
  HOVER = 0,
  /** 飞行器偏航角 */
  ROTATE_YAW = 1,
  /** 云台偏航角 */
  CAMERA_POSITION_X = 2,
  /** 云台俯仰角 */
  CAMERA_POSITION_Y = 3,
  /** 相机变焦 */
  ZOOM = 4,
  /** 拍照 */
  GET_PICTURE = 5,
  /** 开启AI */
  OPEN_AI = 6,
  /** 关闭AI */
  CLOSE_AI = 7,
  /** 镜头切换 */
  LEN_CHANGE = 8,
  /** 对焦 */
  FOCUS_CENTER = 9,
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
    ActionTypeEnum.ROTATE_YAW,
    {
      key: 'ROTATE_YAW',
      actionName: '飞行器偏航角',
      config: {
        aircraftHeading: 0,
      },
      type: 'ROTATE_YAW',
    },
  ],
  [
    ActionTypeEnum.CAMERA_POSITION_X,
    {
      key: 'CAMERA_POSITION_X',
      actionName: '云台偏航角',
      config: {
        x: 0,
      },
      type: 'CAMERA_POSITION',
    },
  ],
  [
    ActionTypeEnum.CAMERA_POSITION_Y,
    {
      key: 'CAMERA_POSITION_Y',
      actionName: '云台俯仰角',
      config: {
        y: 0,
      },
      type: 'CAMERA_POSITION',
    },
  ],
  [
    ActionTypeEnum.ZOOM,
    {
      key: 'ZOOM',
      actionName: '相机变焦',
      config: {
        focalLength: 5,
      },
      type: 'ZOOM',
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
  [
    ActionTypeEnum.LEN_CHANGE,
    {
      key: 'LEN_CHANGE',
      actionName: '镜头切换',
      config: {
        actionTiming: 'ARRIVE',
        videoType: 'wide',
      },
      type: 'LEN_CHANGE',
    },
  ],
  [
    ActionTypeEnum.OPEN_AI,
    {
      key: 'OPEN_AI',
      actionName: '开启算法',
      config: {},
      type: 'OPEN_AI',
    },
  ],
  [
    ActionTypeEnum.CLOSE_AI,
    {
      key: 'CLOSE_AI',
      actionName: '关闭算法',
      config: {},
      type: 'CLOSE_AI',
    },
  ],
  [
    ActionTypeEnum.FOCUS_CENTER,
    {
      key: 'FOCUS_CENTER',
      type: 'FOCUS_CENTER',
      actionName: '对焦',
      config: {},
    },
  ],
])

export const iconMap = new Map<ActionTypeEnum, React.ReactNode>([
  [ActionTypeEnum.HOVER, <WRJXT key={ActionTypeEnum.HOVER} />],
  [ActionTypeEnum.ROTATE_YAW, <FXQPHJ key={ActionTypeEnum.ROTATE_YAW} />],
  [
    ActionTypeEnum.CAMERA_POSITION_X,
    <YTPHJ key={ActionTypeEnum.CAMERA_POSITION_X} />,
  ],
  [
    ActionTypeEnum.CAMERA_POSITION_Y,
    <YTFYJ key={ActionTypeEnum.CAMERA_POSITION_Y} />,
  ],
  [ActionTypeEnum.ZOOM, <XJBJ key={ActionTypeEnum.ZOOM} />],
  [ActionTypeEnum.GET_PICTURE, <PZ key={ActionTypeEnum.GET_PICTURE} />],
  [
    ActionTypeEnum.LEN_CHANGE,
    <IconCameraSwitch key={ActionTypeEnum.LEN_CHANGE} />,
  ],
  [ActionTypeEnum.OPEN_AI, <IconAIEnable key={ActionTypeEnum.OPEN_AI} />],
  [ActionTypeEnum.CLOSE_AI, <IconAIDisable key={ActionTypeEnum.CLOSE_AI} />],
  [
    ActionTypeEnum.FOCUS_CENTER,
    <IconFocus key={ActionTypeEnum.FOCUS_CENTER} />,
  ],
])

export const actionKeys = Array.from(actionMap.keys())
