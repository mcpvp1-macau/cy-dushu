import DeviceIconAIRPORT from '@/assets/icons/jsx/device/DeviceIconAIRPORT'
import DeviceIconCamera from '@/assets/icons/jsx/device/DeviceIconCamera'
import DeviceIconRebotDog from '@/assets/icons/jsx/device/DeviceIconRebotDog'
import DeviceIconENFORCEMENT from '@/assets/icons/jsx/device/DeviceIconENFORCEMENT_RECODER'
import DeviceIconTracker from '@/assets/icons/jsx/device/DeviceIconTracker'
import DeviceIconTTP_BOX from '@/assets/icons/jsx/device/DeviceIconTTP_BOX'
import DeviceIconUAV2 from '@/assets/icons/jsx/device/DeviceIconUAV2'
import DeviceIconWANGLOU from '@/assets/icons/jsx/device/DeviceIconWANGLOU'
import DeviceIconER_EF_CAR from '@/assets/icons/jsx/device/DeviceIconER_EF_CAR'
import DeviceIconRadar from '@/assets/icons/jsx/device/DeviceIconRadar'
import DeviceIconTHEODOLITE from '@/assets/icons/jsx/device/DeviceIconTHEODOLITE'
import DeviceIconLaser from '@/assets/icons/jsx/device/DeviceIconLaser'
import DeviceIconSHELL from '@/assets/icons/jsx/device/DeviceIconSHELL'
import DeviceIconMC from '@/assets/icons/jsx/device/DeviceIconMC'

export enum DeviceEnum {
  UAV = 'UAV',
  ROBOT_DOG = 'ROBOT_DOG',
  SITE_ENFORCEMENT_RECORDER = 'SITE_ENFORCEMENT_RECORDER',
  RADAR = 'RADAR',
  WANGLOU = 'WANGLOU',
  CAMERA = 'CAMERA',
  DEVICE_CHANNEL = 'DEVICE_CHANNEL',
  AIS_BASE_STATION = 'AIS_BASE_STATION',
  VHF = 'VHF',
  SEARCHLIGHT = 'SEARCHLIGHT',
  NVR = 'NVR',
  DVR = 'DVR',
  TTP_BOX = 'TTP_BOX',
  UAV_AIRPORT = 'UAV_AIRPORT',
  VISIBLE_LIGHT_CAMERA = 'VISIBLE_LIGHT_CAMERA',
  INFRARED_CAMERA = 'INFRARED_CAMERA',
  /** 追踪器 */
  TRACKER = 'TRACKER',
  /** 电子干扰侦查战车 */
  ER_EF_CAR = 'ER_EF_CAR',
  /** 光电经纬仪 */
  THEODOLITE = 'THEODOLITE',
  /** 激光武器 */
  LASER_WEAPON = 'LASER_WEAPON',
  /** 高炮 */
  SHELL = 'SHELL',
  /** 微波武器 */
  MICROWAVE = 'MICROWAVE',
}

const deviceTypeWeight = new Map<string, number>([
  [DeviceEnum.UAV, 1],
  [DeviceEnum.UAV_AIRPORT, 10],
  [DeviceEnum.WANGLOU, 100],
  [DeviceEnum.CAMERA, 10000],
  [DeviceEnum.SITE_ENFORCEMENT_RECORDER, 100000],
])

/** 获取设备权重 */
export const getDeviceWeight = (type: string) =>
  deviceTypeWeight.get(type) ?? Number.MAX_VALUE / 2

/** 图标映射 */
export const deviceIconMap = {
  [DeviceEnum.UAV]: DeviceIconUAV2,
  [DeviceEnum.UAV_AIRPORT]: DeviceIconAIRPORT,
  [DeviceEnum.TTP_BOX]: DeviceIconTTP_BOX,
  [DeviceEnum.CAMERA]: DeviceIconCamera,
  [DeviceEnum.WANGLOU]: DeviceIconWANGLOU,
  [DeviceEnum.SITE_ENFORCEMENT_RECORDER]: DeviceIconENFORCEMENT,
  [DeviceEnum.TRACKER]: DeviceIconTracker,
  [DeviceEnum.ROBOT_DOG]: DeviceIconRebotDog,
  // 电子干扰侦查战车
  [DeviceEnum.ER_EF_CAR]: DeviceIconER_EF_CAR,
  // 
  [DeviceEnum.RADAR]: DeviceIconRadar,
  // 光电经纬仪
  [DeviceEnum.THEODOLITE]: DeviceIconTHEODOLITE,
  // 激光武器
  [DeviceEnum.LASER_WEAPON]: DeviceIconLaser,
  // 高炮
  [DeviceEnum.SHELL]: DeviceIconSHELL,
  // 微波武器
  [DeviceEnum.MICROWAVE]: DeviceIconMC,
}

export enum DeviceStatusEnum {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export const StatusColorMap = {
  [DeviceStatusEnum.ONLINE]: 'rgb(21, 179, 113)',
  [DeviceStatusEnum.OFFLINE]: 'rgb(228, 89, 81)',
}

export const UpdateStatusMap = {
  NO_UPGRADE: '无需升级',
  WAITING_UPGRADE: '等待升级，未执行升级操作',
  PENDING: '升级等待中，执行升级操作，排队中',
  DOWNLOADING: '下载中',
  INSTALLING: '安装中',
  REBOOTING: '重启中',
  SUCCESS: '升级成功',
  FAILED: '升级失败',
}

export enum UpdateStatusEnum {
  NO_UPGRADE = 'NO_UPGRADE',
  WAITING_UPGRADE = 'WAITING_UPGRADE',
  PENDING = 'PENDING',
  DOWNLOADING = 'DOWNLOADING',
  INSTALLING = 'INSTALLING',
  REBOOTING = 'REBOOTING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum DJIOtaStatusEnum {
  NO_UPGRADE = 'NO_UPGRADE',
  UPGRADE = 'UPGRADE',
  UPGRADE_ING = 'UPGRADING',
}