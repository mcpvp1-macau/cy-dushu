/**
 * 固定翼无人机（CY-9A）纯前端演示数据
 * 后端就绪后可整体替换为真实接口数据
 */

/** 演示设备 deviceId 前缀 */
export const FIXED_WING_DEMO_ID_PREFIX = 'fixed-wing-demo-'

/** 是否为固定翼演示设备 */
export const isFixedWingDemoDevice = (deviceId?: string | null) =>
  !!deviceId && deviceId.startsWith(FIXED_WING_DEMO_ID_PREFIX)

/** 健康状况枚举（0 正常，其余为告警） */
export const FIXED_WING_HEALTH_STATES = [
  '正常',
  '卫星导航异常',
  '数据链路异常',
  '动力系统异常',
  '电气系统异常',
  '飞控系统异常',
  '任务载荷异常',
  '燃油量低',
  '发动机超温',
] as const

/** 激光测距状态 */
export const FIXED_WING_LASER_STATES = [
  '单次测距',
  '连续测距',
  '激光照射',
  '测距停',
] as const

/** 可执行任务类型 */
export const FIXED_WING_TASK_CAPABILITIES = ['侦察', '打击', '察打一体'] as const

/** 包头 447 靶场演示坐标，与任务/航线区域保持一致 */
const BAOTOU_POINTS = {
  audienceStand: [109.59264679, 40.87423242],
  cy9aReconStart: [109.54119737, 40.87408504],
  smallUavTakeoff: [109.59256368, 40.87428219],
  targetStrike: [109.59175665, 40.8741476],
} satisfies Record<string, [number, number]>

/** 小无人机 B 区域四角坐标 */
const SMALL_UAV_AREA = [
  [109.5826864, 40.8742758],
  [109.59191485, 40.87426525],
  [109.5919144, 40.87037189],
  [109.58269399, 40.87036621],
] satisfies [number, number][]

/** 给同起点设备轻微错开，避免地图标记完全重叠 */
const offsetPosition = ([longitude, latitude]: [number, number], lngOffset: number, latOffset: number) =>
  [longitude + lngOffset, latitude + latOffset] satisfies [number, number]

/** 演示遥测数据（静态） */
export const FIXED_WING_DEMO_TELEMETRY = {
  /** 链路类型 */
  linkType: 'Ku 卫星链路',
  /** 油量 % */
  fuel: 68,
  /** 地速 m/s */
  groundSpeed: 42.0,
  /** 相对高度 m */
  relativeHeight: 1180.0,
  /** 海拔 m */
  asl: 1200.0,
  /** 无线电高度 m */
  radioHeight: 96.5,
  /** 飞机位置 */
  longitude: BAOTOU_POINTS.cy9aReconStart[0],
  latitude: BAOTOU_POINTS.cy9aReconStart[1],
  /** 姿态 */
  pitch: 2.4,
  roll: -1.2,
  yaw: 85.8,
  /** 航向角 flyYaw */
  flyYaw: 86.0,
  /** 航迹角 flyFpa */
  flyFpa: 83.5,
  /** 系统自检 0 正常 */
  sysCheckState: 0,
  /** 吊舱 */
  payloadAzimuth: 124.0,
  payloadPitch: -12.5,
  snsrFov: 18.0,
  /** 激光测距值 m */
  laserData: 1380,
  /** 目标定位 */
  targetLongitude: BAOTOU_POINTS.targetStrike[0],
  targetLatitude: BAOTOU_POINTS.targetStrike[1],
  targetAltitude: 116,
}

/** 演示机队中心点（包头 447 靶场） */
export const DEMO_FLEET_CENTER = {
  longitude: FIXED_WING_DEMO_TELEMETRY.longitude,
  latitude: FIXED_WING_DEMO_TELEMETRY.latitude,
}

/** 创建演示设备 */
const makeDevice = (
  idx: number,
  deviceName: string,
  deviceType: string,
  position: [number, number],
  power = 90,
  status = 'ONLINE',
): API_DEVICE.domain.Device => ({
  name: deviceName,
  deviceId: `${FIXED_WING_DEMO_ID_PREFIX}${String(idx).padStart(3, '0')}`,
  deviceName,
  deviceType,
  productKey: `${deviceType.toLowerCase()}-demo`,
  sn: `DEMO-${String(idx).padStart(3, '0')}`,
  status,
  taskStatus: '',
  remainingPower: power,
  createTime: Date.now(),
  longitude: position[0],
  latitude: position[1],
  altitude: 120,
  spaceId: '',
  deviceRegisterVersion: '',
  deviceTags: [],
  properties: {},
  parentId: '',
  subDevice: false,
  deviceModel: undefined as unknown as API_DEVICE.domain.DeviceModel,
})

/** 固定翼演示设备（右侧详情/驾驶舱使用） */
export const FIXED_WING_DEMO_DEVICES: API_DEVICE.domain.Device[] = [
  makeDevice(1, 'CY-9A-001', 'FIXED_WING', BAOTOU_POINTS.cy9aReconStart, FIXED_WING_DEMO_TELEMETRY.fuel),
]

/** 完整演示机队（注入地图设备，纯前端） */
export const DEMO_FLEET_DEVICES: API_DEVICE.domain.Device[] = [
  ...FIXED_WING_DEMO_DEVICES,
  makeDevice(2, 'DJI M400', 'UAV', SMALL_UAV_AREA[0], 88),
  makeDevice(3, 'DJI M350', 'UAV', offsetPosition(BAOTOU_POINTS.targetStrike, -0.0003, -0.0001), 76),
  makeDevice(4, 'DJI M300-01', 'UAV', SMALL_UAV_AREA[1], 82),
  makeDevice(5, 'DJI 30T-01', 'UAV', SMALL_UAV_AREA[2], 91),
  makeDevice(6, '紫燕 F15', 'UAV', BAOTOU_POINTS.audienceStand, 64),
  makeDevice(7, 'HY-3', 'UAV', offsetPosition(BAOTOU_POINTS.smallUavTakeoff, -0.00018, -0.00018), 70),
  makeDevice(8, '机器狗-01', 'ROBOT_DOG', offsetPosition(BAOTOU_POINTS.smallUavTakeoff, 0.00018, -0.00012), 95),
  makeDevice(9, 'DJI M300-02', 'UAV', offsetPosition(SMALL_UAV_AREA[1], -0.00022, -0.00016), 84),
  makeDevice(10, 'DJI 30T-02', 'UAV', offsetPosition(SMALL_UAV_AREA[2], 0.00022, 0.00016), 89),
]

/** 演示设备类型（资源页 Tab / 设备树, 固定翼并入无人机类目） */
export const DEMO_DEVICE_TYPES = [
  { type: 'UAV', name: '无人机', productKey: 'uav-demo', icon: '', markerIcon: '' },
  {
    type: 'ROBOT_DOG',
    name: '机器狗',
    productKey: 'robot-dog-demo',
    icon: '',
    markerIcon: '',
  },
]

/** 各设备默认可执行任务类型 */
export const DEMO_TASK_CAPABILITY_DEFAULTS: Record<string, string> = {
  [`${FIXED_WING_DEMO_ID_PREFIX}001`]: '察打一体', // CY-9A
  [`${FIXED_WING_DEMO_ID_PREFIX}003`]: '打击', // DJI M350
}

/** 获取设备默认可执行任务类型 */
export const getDefaultTaskCapability = (deviceId: string) =>
  DEMO_TASK_CAPABILITY_DEFAULTS[deviceId] ?? '侦察'

/** 根据 deviceId 获取演示设备 */
export const getFixedWingDemoDevice = (deviceId?: string | null) =>
  DEMO_FLEET_DEVICES.find((e) => e.deviceId === deviceId)
