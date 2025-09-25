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
import { QuestionCircleOutlined } from '@ant-design/icons'
import IconCameraMode from '@/assets/icons/jsx/IconCameraMode'
import IconLoudspeaker from '@/assets/icons/jsx/IconLoudspeaker'
import IconStartRecord from '@/assets/icons/jsx/IconStartRecord'
import IconStopRecord from '@/assets/icons/jsx/IconStopRecord'

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
  /** 镜头模式 */
  CAMERA_MODE = 10,
  /** 喊话器 */
  SPEAKER_PLAY = 11,
  /** 开始录制 */
  START_RECORD = 12,
  /** 停止录制 */
  STOP_RECORD = 13,
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
  [
    ActionTypeEnum.CAMERA_MODE,
    {
      key: 'CAMERA_MODE_SET',
      type: 'CAMERA_MODE_SET',
      actionName: '镜头模式',
      config: {
        mode: '0', // 0 拍照 1 录像 2 低光 3 全景
      },
    },
  ],
  [
    ActionTypeEnum.SPEAKER_PLAY,
    {
      key: 'SPEAKER_PLAY',
      type: 'SPEAKER_PLAY',
      actionName: '喊话器',
      config: {
        action: 'start', // start 开始播放 stop 停止播放
        mode: 'single', // single 单次播放 loop 循环播放
        text: '',
        volume: 100,
      },
    },
  ],
  [
    ActionTypeEnum.START_RECORD,
    {
      key: 'START_RECORD',
      type: 'START_RECORD',
      actionName: '开始录制',
      config: {
        payloadLensIndex: [],
        useGlobalPayloadLensIndex: 1, // 是否跟随全局设置
      },
    },
  ],
  [
    ActionTypeEnum.STOP_RECORD,
    {
      key: 'STOP_RECORD',
      type: 'STOP_RECORD',
      actionName: '停止录制',
      config: {
        payloadLensIndex: [],
        useGlobalPayloadLensIndex: 1, // 是否跟随全局设置
      },
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
  [
    ActionTypeEnum.CAMERA_MODE,
    <IconCameraMode key={ActionTypeEnum.CAMERA_MODE} />,
  ],
  [
    ActionTypeEnum.SPEAKER_PLAY,
    <IconLoudspeaker key={ActionTypeEnum.SPEAKER_PLAY} />,
  ],
  [
    ActionTypeEnum.START_RECORD,
    <IconStartRecord key={ActionTypeEnum.START_RECORD} />,
  ],
  [
    ActionTypeEnum.STOP_RECORD,
    <IconStopRecord key={ActionTypeEnum.STOP_RECORD} />,
  ],
])

export const actionKeys = Array.from(actionMap.keys())

export const getIcon = (action: any) => {
  if (!action) return
  if (action.type === 'HOVER') {
    return <WRJXT />
  }
  if (action?.type === 'ROTATE_YAW') {
    return <FXQPHJ />
  }
  if (action?.type === 'CAMERA_POSITION' && action.config.x !== undefined) {
    return <YTPHJ />
  }
  if (action?.type === 'CAMERA_POSITION' && action.config.y !== undefined) {
    return <YTFYJ />
  }
  if (action?.type === 'GET_PICTURE') {
    return <PZ />
  }
  if (action?.type === 'LEN_CHANGE') {
    return <IconCameraSwitch />
  }
  if (action?.type === 'ZOOM') {
    return <XJBJ />
  }
  if (action?.type === 'OPEN_AI') {
    return <IconAIEnable />
  }
  if (action?.type === 'CLOSE_AI') {
    return <IconAIDisable />
  }
  if (action?.type === 'FOCUS_CENTER') {
    return <IconFocus />
  }
  if (action?.type === 'CAMERA_MODE_SET') {
    return <IconCameraMode />
  }
  if (action?.type === 'SPEAKER_PLAY') {
    return <IconLoudspeaker />
  }
  if (action?.type === 'START_RECORD') {
    return <IconStartRecord />
  }
  if (action?.type === 'STOP_RECORD') {
    return <IconStopRecord />
  }
  return <QuestionCircleOutlined />
}
