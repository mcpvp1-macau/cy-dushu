import { SelectProps } from 'antd'
import { WANGLOUTargetName } from './config' // Adjust the import path as necessary

const useConfig = () => {
  const { t } = useTranslation()
  const wanglouDeviceOptions: Required<SelectProps>['options'] = [
    {
      label: t('device.wanglou.child.beidou'),
      value: WANGLOUTargetName.BeiDou,
    },
    {
      label: t('device.wanglou.child.battery'),
      value: WANGLOUTargetName.Battery,
    },
    {
      label: t('device.wanglou.child.turntable'),
      value: WANGLOUTargetName.Turntable,
    },
    {
      label: t('device.wanglou.child.visiblelight'),
      value: WANGLOUTargetName.VisibleLight,
    },
    {
      label: t('device.wanglou.child.ir'),
      value: WANGLOUTargetName.Infrared,
    },
    {
      label: t('device.wanglou.child.radar'),
      value: WANGLOUTargetName.Radar,
    },
    {
      label: t('device.wanglou.child.vibrator'),
      value: WANGLOUTargetName.Vibrator,
    },
    // {
    //   label: 'Mesh',
    //   value: WANGLOUTargetName.Mesh,
    // },
  ]

  const statusFormatter = (value: string) => {
    if (value === t('source.status.online') || value === t('device.status.online.OFFLINE')) {
      return value
    }
    return value === 'ONLINE' ? t('source.status.online') : t('device.status.online.OFFLINE')
  }

  const statusWarning = (value: string) => {
    return value !== 'ONLINE' && value !== '在线'
  }

  const powerWarning = (value: number) => {
    return value < 20
  }

  // config 中 key 只能是 tabSelectOptions 中的 value
  type Property = {
    label: string
    propertyName: string
    formatter?: (value: any, properties?: any) => string
    warnConfig?: {
      enable?: (value: any) => boolean
      tooltip?: string
      warningName?: string
      showCusWaring?: (info: any) => boolean
    }
    getValue?: (properties: any) => string
  }

  const wanglouDeviceInfo: {
    [key: string]: Property[]
  } = {
    [WANGLOUTargetName.WANGLOU]: [
      {
        label: t('resource.table.deviceModel.title'),
        propertyName: 'model',
      },
      {
        label: t('common.onlineStatus'),
        propertyName: 'status',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },
      {
        label: t('common.longitude'),
        propertyName: 'longitude',
      },
      {
        label: t('common.latitude'),
        propertyName: 'latitude',
      },
      {
        label: t('common.altitude'),
        propertyName: 'altitude',
        formatter: (value) => `${value}m`,
      },
      {
        label: t('device.wanglou.child.beidouStatus'),
        propertyName: 'beidouStatus',
        formatter: statusFormatter,

        warnConfig: {
          warningName: 'beidouWaringInfo',
          enable: statusWarning,
          showCusWaring: (info) => info !== null,
        },
      },
      {
        label: t('common.remainingPower'),
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
        label: t('device.wanglou.child.turntableStatus'),
        propertyName: 'turntableStatus',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },
      {
        label: t('device.wanglou.child.turntablePose'),
        propertyName: 'turntablePose',
      },
      {
        label: t('device.wanglou.child.visibleLightStatus'),
        propertyName: 'visibleLightStatus',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },
      {
        label: '红外状态',
        propertyName: 'infraredStatus',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },
      {
        label: '震动仪状态',
        propertyName: 'vibratorStatus',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },
      {
        label: '雷达状态',
        propertyName: 'radarStatus',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },
      {
        label: '边缘计算',
        propertyName: 'edgeComputeDeviceStatus',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
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
        label: t('device.wanglou.child.beidouStatus'),
        propertyName: 'status',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },

      {
        label: t('common.longitude'),
        propertyName: 'dbLongitude',
      },
      {
        label: t('device.beidou.dbMagDegree'),
        propertyName: 'dbMagDegree',
        formatter: (value) => `${value}°`,
      },
      {
        label: t('common.latitude'),
        propertyName: 'dbLatitude',
      },
      {
        label: t('device.beidou.dbCourse'),
        propertyName: 'dbCourse',
        formatter: (value) => `${value}°`,
      },
    ],
    [WANGLOUTargetName.Battery]: [
      {
        label: t('device.battery.current'),
        propertyName: 'current',
      },
      {
        label: t('device.battery.voltage'),
        propertyName: 'voltage',
      },
      {
        label: t('device.battery.dischargeState'),
        propertyName: 'dischargeState',
      },
      {
        label: t('device.battery.soh'),
        propertyName: 'soh',
      },
      {
        label: t('device.battery.chargeState'),
        propertyName: 'chargeState',
      },
      {
        label: t('device.battery.electricity'),
        propertyName: 'electricity',
      },
    ],
    [WANGLOUTargetName.Turntable]: [
      {
        label: t('device.wanglou.child.turntableStatus'),
        propertyName: 'status',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },
      {
        label: `${t('device.wanglou.child.turntable')}${t('common.northCorner')}`,
        propertyName: 'northCorner',
        formatter: (value) => `${value}°`,
      },
      {
        label: `${t('device.wanglou.child.turntable')}${t('commoin.pose')}`,
        propertyName: 'turntablePose',
        getValue: (properties) => {
          return `${(properties?.['yaw'] || 0) / 100}°; ${
            (properties?.['pitch'] || 0) / 100
          }°`
        },
      },
      {
        label: `${t('device.wanglou.child.turntable')}${t('common.pitch')}`,
        propertyName: 'horizontalAngle',
        formatter: (value) => `${value}°`,
      },
    ],
    [WANGLOUTargetName.VisibleLight]: [
      {
        label: t('common.deviceStatus'),
        propertyName: 'status',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },
      {
        label: t('common.fov.x'),
        propertyName: 'fov',
        formatter: (value) => `${value?.toFixed(6)}°`,
      },
      {
        label: t('common.focalDistance'),
        propertyName: 'focalDistance',
      },
      {
        label: t('common.fov.y'),
        propertyName: 'fov',
        formatter: (value: any, properties: any) =>
          `${(value / (properties?.['aspectRatio'] || 1)).toFixed(6)}°`,
      },
      {
        label: t('common.zoomRadio'),
        propertyName: 'zoomRadio',
      },
    ],
    [WANGLOUTargetName.Infrared]: [
      {
        label: t('common.deviceStatus'),
        propertyName: 'status',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },
      {
        label: t('common.fov.x'),
        propertyName: 'fov',
        formatter: (value) => `${value?.toFixed(6)}°`,
      },
      {
        label: t('common.focalDistance'),
        propertyName: 'focalDistance',
      },

      {
        label: t('common.fov.y'),
        propertyName: 'fov',
        formatter: (value: any, properties: any) =>
          `${(value / (properties?.['aspectRatio'] || 1)).toFixed(6)}°`,
      },
      {
        label: t('common.zoomRadio'),
        propertyName: 'zoomRadio',
      },
    ],
    [WANGLOUTargetName.Radar]: [
      {
        label: t('common.deviceStatus'),
        propertyName: 'status',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },

      {
        label: t('device.radar.northCorner'),
        propertyName: 'northCorner',
        formatter: (value) => `${value / 100}°`,
      },
      {
        label: t('common.groundLift'),
        propertyName: 'groundLift',
        formatter: (value) => `${value}m`,
      },
    ],
    [WANGLOUTargetName.Vibrator]: [
      {
        label: t('common.deviceStatus'),
        propertyName: 'status',
        formatter: statusFormatter,
        warnConfig: {
          enable: statusWarning,
          tooltip: t('device.status.def'),
        },
      },
      {
        label: t('common.longitude'),
        propertyName: 'longitude',
      },
      {
        label: t('common.latitude'),
        propertyName: 'latitude',
      },
    ],
  }

  return { wanglouDeviceOptions, wanglouDeviceInfo }
}

export default useConfig
