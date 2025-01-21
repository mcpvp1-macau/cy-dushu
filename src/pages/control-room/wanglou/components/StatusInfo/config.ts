import { FieldValue } from '@/utils/other/utils'

export interface Property {
  label: string
  propertyName: string
  formatter?: (value: any, properties?: any) => FieldValue
  getValue?: (properties: any) => FieldValue
  warnConfig?: {
    enable?: (value: any) => boolean
    showCusWaring?: (value: any) => boolean
    tooltip?: string
    warningName?: string
  }
  width?: number
}

export enum WANGLOUTargetName {
  /** 望楼 */
  WANGLOU = 'WANGLOU',
  /** 北斗 */
  BeiDou = 'BEIDOU',
  /** 电池 */
  Battery = 'BATTERY',
  /** 转台（望楼） */
  Turntable = 'TURNTABLE',
  /** 可见光 */
  VisibleLight = 'VISUAL',
  /** 红外 */
  Infrared = 'INFRARED',
  /** 雷达 */
  Radar = 'RADAR',
  /** 震动仪 */
  Vibrator = 'VIBRATOR',
  /** 融合目标 */
  FusionTarget = 'FUSION',
  /** 边缘计算 */
  EdgeCompute = 'EdgeCompute',
  /** Mesh */
  Mesh = 'Mesh',
}

// 望楼子设备 id 手动映射类型
export const WanglouDeviceTypeMap: { [key: string]: string } = {
  [WANGLOUTargetName.Radar]: 'k8dNIRut1q3',
  [WANGLOUTargetName.VisibleLight]: 'uvFrSFW2zMs',
  [WANGLOUTargetName.Infrared]: 'mVpLCOnTPLz',
  [WANGLOUTargetName.BeiDou]: 'raYeBHvRKYP',
  [WANGLOUTargetName.Battery]: 'eX71parWGpf',
  [WANGLOUTargetName.Vibrator]: 'r4ae3Loh78v',
  [WANGLOUTargetName.EdgeCompute]: 'dTz5djGU3Jb',
  [WANGLOUTargetName.Mesh]: '68ai6goNgw5',
}

export const WanglouDeviceProductMap: { [key: string]: string } = {
  k8dNIRut1q3: WANGLOUTargetName.Radar,
  uvFrSFW2zMs: WANGLOUTargetName.VisibleLight,
  mVpLCOnTPLz: WANGLOUTargetName.Infrared,
  raYeBHvRKYP: WANGLOUTargetName.BeiDou,
  eX71parWGpf: WANGLOUTargetName.Battery,
  r4ae3Loh78v: WANGLOUTargetName.Vibrator,
  dTz5djGU3Jb: WANGLOUTargetName.EdgeCompute,
  '68ai6goNgw5': WANGLOUTargetName.Mesh,
}

