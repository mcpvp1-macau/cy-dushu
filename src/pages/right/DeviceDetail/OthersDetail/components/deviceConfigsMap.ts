export type DeviceConfigs = {
  /** 是否有驾驶舱 */
  isHaveControlRoom: boolean
  /** 是否有视频 */
  isHaveVideo: boolean
  /** 是否有转台 */
  isHaveControl: boolean
  /** 是否有控制权 */
  isHaveControlPower: boolean
  /** 是否有AI */
  isHaveAI: boolean
}

const DeviceConfigsMap: { [key: string]: DeviceConfigs } = {
  ['TIANLANG']: {
    /** 是否有驾驶舱 */
    isHaveControlRoom: true,
    /** 是否有视频 */
    isHaveVideo: true,
    /** 是否有转台 */
    isHaveControl: true,
    /** 是否有控制权 */
    isHaveControlPower: false,
    /** 是否有AI */
    isHaveAI: true,
  },
  default: {
    /** 是否有驾驶舱 */
    isHaveControlRoom: false,
    /** 是否有视频 */
    isHaveVideo: true,
    /** 是否有转台 */
    isHaveControl: false,
    /** 是否有控制权 */
    isHaveControlPower: false,
    /** 是否有AI */
    isHaveAI: false,
  },
}

export default DeviceConfigsMap
