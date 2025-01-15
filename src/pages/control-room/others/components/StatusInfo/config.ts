import { FieldValue } from '@/utils/other/utils'
import { SelectProps } from 'antd'

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

export const wanglouDeviceOptions: Required<SelectProps>['options'] = [
  {
    label: '北斗',
    value: WANGLOUTargetName.BeiDou,
  },
  {
    label: '电池',
    value: WANGLOUTargetName.Battery,
  },
  {
    label: '转台',
    value: WANGLOUTargetName.Turntable,
  },
  {
    label: '可见光',
    value: WANGLOUTargetName.VisibleLight,
  },
  {
    label: '红外',
    value: WANGLOUTargetName.Infrared,
  },
  {
    label: '雷达',
    value: WANGLOUTargetName.Radar,
  },
  {
    label: '震动仪',
    value: WANGLOUTargetName.Vibrator,
  },
  // {
  //   label: 'Mesh',
  //   value: WANGLOUTargetName.Mesh,
  // },
]

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

const statusFormatter = (value: string) => {
  if (value === '在线' || value === '离线') {
    return value
  }
  return value === 'ONLINE' ? '在线' : '离线'
}

const statusWarning = (value: string) => {
  return value !== 'ONLINE' && value !== '在线'
}

const powerWarning = (value: number) => {
  return value < 20
}

// config 中 key 只能是 tabSelectOptions 中的 value
export const wanglouDeviceInfo: {
  [key: string]: Property[]
} = {
  [WANGLOUTargetName.WANGLOU]: [
    {
      label: '设备型号',
      propertyName: 'model',
    },
    {
      label: '在线状态',
      propertyName: 'status',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },
    {
      label: '经度',
      propertyName: 'longitude',
    },
    {
      label: '纬度',
      propertyName: 'latitude',
    },
    {
      label: '海拔高度',
      propertyName: 'altitude',
      formatter: (value) => `${value}m`,
    },
    {
      label: '北斗状态',
      propertyName: 'beidouStatus',
      formatter: statusFormatter,

      warnConfig: {
        warningName: 'beidouWaringInfo',
        enable: statusWarning,
        showCusWaring: (info) => info !== null,
      },
    },
    {
      label: '当前电量',
      propertyName: 'remainingPower',
      warnConfig: {
        // enable: () => false,
        // tooltip: '电量过低',
        warningName: 'remainingPowerWaringInfo',
        // enable: (info) => info !== null,
        showCusWaring: (info) => info !== null,
      },
    },
    {
      label: '转台状态',
      propertyName: 'turntableStatus',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },
    {
      label: '转台姿态',
      propertyName: 'turntablePose',
    },
    {
      label: '可见光状态',
      propertyName: 'visibleLightStatus',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },
    {
      label: '红外状态',
      propertyName: 'infraredStatus',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },
    {
      label: '震动仪状态',
      propertyName: 'vibratorStatus',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },
    {
      label: '雷达状态',
      propertyName: 'radarStatus',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },
    {
      label: '边缘计算',
      propertyName: 'edgeComputeDeviceStatus',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },

    {
      label: '网络状态',
      propertyName: 'edgeComputeStatus',
      formatter: statusFormatter,
      warnConfig: {
        // enable: statusWarning,
        // tooltip: '设备离线',
        warningName: 'edgeComputeDeviceWarningInfo',
        enable: statusWarning,
        showCusWaring: (info) => info !== null,
      },
    },
  ],
  [WANGLOUTargetName.BeiDou]: [
    {
      label: '北斗状态',
      propertyName: 'status',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },

    {
      label: '经度',
      propertyName: 'dbLongitude',
    },
    {
      label: '磁偏角',
      propertyName: 'dbMagDegree',
      formatter: (value) => `${value}°`,
    },
    {
      label: '纬度',
      propertyName: 'dbLatitude',
    },
    {
      label: '方位角',
      propertyName: 'dbCourse',
      formatter: (value) => `${value}°`,
    },
  ],
  [WANGLOUTargetName.Battery]: [
    {
      label: '电流',
      propertyName: 'current',
    },
    {
      label: '电压',
      propertyName: 'voltage',
    },
    {
      label: '放电状态',
      propertyName: 'dischargeState',
    },
    {
      label: '健康度百分比',
      propertyName: 'soh',
    },
    {
      label: '充电状态',
      propertyName: 'chargeState',
    },
    {
      label: '电量百分比',
      propertyName: 'electricity',
    },
  ],
  [WANGLOUTargetName.Turntable]: [
    {
      label: '转台状态',
      propertyName: 'status',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },
    {
      label: '转台偏北角',
      propertyName: 'northCorner',
      formatter: (value) => `${value}°`,
    },
    {
      label: '转台姿态',
      propertyName: 'turntablePose',
      getValue: (properties) => {
        return `${(properties?.['yaw'] || 0) / 100}°; ${
          (properties?.['pitch'] || 0) / 100
        }°`
      },
    },
    {
      label: '转台俯仰角',
      propertyName: 'horizontalAngle',
      formatter: (value) => `${value}°`,
    },
  ],
  [WANGLOUTargetName.VisibleLight]: [
    {
      label: '设备状态',
      propertyName: 'status',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },
    {
      label: '水平视场角',
      propertyName: 'fov',
      formatter: (value) => `${value?.toFixed(6)}°`,
    },
    {
      label: '焦距值',
      propertyName: 'focalDistance',
    },
    {
      label: '垂直视场角',
      propertyName: 'fov',
      formatter: (value: any, properties: any) =>
        `${(value / (properties?.['aspectRatio'] || 1)).toFixed(6)}°`,
    },
    {
      label: '变倍值',
      propertyName: 'zoomRadio',
    },
  ],
  [WANGLOUTargetName.Infrared]: [
    {
      label: '设备状态',
      propertyName: 'status',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },
    {
      label: '水平视场角',
      propertyName: 'fov',
      formatter: (value) => `${value?.toFixed(6)}°`,
    },
    {
      label: '焦距值',
      propertyName: 'focalDistance',
    },

    {
      label: '垂直视场角',
      propertyName: 'fov',
      formatter: (value: any, properties: any) =>
        `${(value / (properties?.['aspectRatio'] || 1)).toFixed(6)}°`,
    },
    {
      label: '变倍值',
      propertyName: 'zoomRadio',
    },
  ],
  [WANGLOUTargetName.Radar]: [
    {
      label: '设备状态',
      propertyName: 'status',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },

    {
      label: '雷达偏北角',
      propertyName: 'northCorner',
      formatter: (value) => `${value / 100}°`,
    },
    {
      label: '离地高度',
      propertyName: 'groundLift',
      formatter: (value) => `${value}m`,
    },
  ],
  [WANGLOUTargetName.Vibrator]: [
    {
      label: '设备状态',
      propertyName: 'status',
      formatter: statusFormatter,
      warnConfig: {
        enable: statusWarning,
        tooltip: '设备离线',
      },
    },
    {
      label: '经度',
      propertyName: 'longitude',
    },
    {
      label: '纬度',
      propertyName: 'latitude',
    },
  ],
}
