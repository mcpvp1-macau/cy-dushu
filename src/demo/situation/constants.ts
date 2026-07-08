import { WaylineEnum } from '@/constant/uav/wayline'

/** 包头 447 靶场演示坐标 */
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

/** 整体 C 区域作业范围四角坐标 */
const C_OPERATION_AREA = [
  [109.52579872, 40.88406377],
  [109.52562523, 40.86321341],
  [109.63228439, 40.86310684],
  [109.52558244, 40.86311609],
] satisfies [number, number][]

/** 演示任务设备 ID */
const DEMO_DEVICE_IDS = {
  cy9a: 'fixed-wing-demo-001',
  m400: 'fixed-wing-demo-002',
  m350: 'fixed-wing-demo-003',
  m300A: 'fixed-wing-demo-004',
  m300B: 'fixed-wing-demo-009',
  dji30tA: 'fixed-wing-demo-005',
  dji30tB: 'fixed-wing-demo-010',
  ziyanF15: 'fixed-wing-demo-006',
  hy3: 'fixed-wing-demo-007',
  robotDog: 'fixed-wing-demo-008',
}

/** 行动列表演示数据 - 一个脚本环节对应一个行动 */
export const DEMO_ACTIONS: API_ACTION.domain.ActionRecord[] = [
  {
    id: 9001,
    actionId: 9001,
    name: '环节一：区域内部侦察与打击',
    status: 'PROCESSING',
    eventId: '',
    startTime: '2026-07-07 08:30:00',
    type: 'normal',
    endTime: '',
    gmtCreate: '2026-07-07 08:30:00',
    gmtModified: '2026-07-07 08:30:00',
    gmtCreateBy: 'demo',
    gmtModifiedBy: 'demo',
    description:
      '机场区域日常巡逻、B区域精细侦察、A目标打击与机器狗递进侦察。',
  },
  {
    id: 9002,
    actionId: 9002,
    name: '环节二：远域侦察与对地打击',
    status: 'PROCESSING',
    eventId: '',
    startTime: '2026-07-07 11:00:00',
    type: 'normal',
    endTime: '',
    gmtCreate: '2026-07-07 11:00:00',
    gmtModified: '2026-07-07 11:00:00',
    gmtCreateBy: 'demo',
    gmtModifiedBy: 'demo',
    description:
      'CY-9A执行C区域远域侦察，并对跟踪目标实施对地打击。',
  },
]

/** 行动类型字典演示数据 */
export const DEMO_DICTS: API_DICT.domain.DictRecord[] = [
  {
    dictGroup: 'action_type',
    dictName: '常规行动',
    dictKey: 'normal',
    isEnable: true,
    orderWeight: 1,
  },
]

/** 生成航点 (pointX 经度 / pointY 纬度 / pointZ 高度) */
const point = (
  pointX: number,
  pointY: number,
  pointZ = 120,
  index = 0,
) => ({
  pointX,
  pointY,
  pointZ,
  index,
})

/** 坐标数组转航点 */
const routePoints = (coordinates: [number, number][], altitude: number) =>
  coordinates.map(([lng, lat], index) => point(lng, lat, altitude, index))

/** 组装航线模板 */
const makeWayline = (
  id: number,
  taskName: string,
  taskType: string,
  points: ReturnType<typeof point>[],
): API_AIRLINE.domain.AIRLINE_TEMPLATE => ({
  username: 'demo',
  templateId: `demo-wayline-${id}`,
  taskName,
  taskType,
  productKey: 'uav-demo',
  taskTemplateFileUrl: '',
  gmtCreate: '2026-07-06 10:00:00',
  gmtModified: '2026-07-06 10:00:00',
  gmtCreateBy: 'demo',
  gmtCreateByName: '演示用户',
  gmtModifiedBy: 'demo',
  waylineTemplateId: id,
  folderId: 0,
  taskBasic: JSON.stringify({
    flyToWaylineMode: 'safely',
    takeOffSecurityHeight: 60,
    globalTransitionalSpeed: 10,
    globalRTHHeight: 120,
    waylineType: taskType,
  }),
  parameters: JSON.stringify({
    spaces: [{ positions: points.map((p, i) => ({ ...p, index: i })) }],
  }),
  isTemplate: 'YES',
  isThird: 'NO',
})

/** 组装蜂群(cluster)航线模板 (多边形区域 + 主航向 + 覆盖率) */
const makeSwarmWayline = (
  id: number,
  taskName: string,
  polygon: [number, number][],
  droneCount: number,
): API_AIRLINE.domain.AIRLINE_TEMPLATE => ({
  username: 'demo',
  templateId: `demo-wayline-${id}`,
  taskName,
  taskType: WaylineEnum.SwarmWayline,
  productKey: 'uav-demo',
  taskTemplateFileUrl: '',
  gmtCreate: '2026-07-06 10:00:00',
  gmtModified: '2026-07-06 10:00:00',
  gmtCreateBy: 'demo',
  gmtCreateByName: '演示用户',
  gmtModifiedBy: 'demo',
  waylineTemplateId: id,
  folderId: 0,
  taskBasic: JSON.stringify({
    flyToWaylineMode: 'safely',
    takeOffSecurityHeight: 60,
    globalTransitionalSpeed: 10,
    globalRTHHeight: 120,
    speed: 8,
    height: 100,
    waylineType: WaylineEnum.SwarmWayline,
    polygon,
    mainK: Math.tan((45 * Math.PI) / 180),
    coverage: 70,
    droneCount,
  }),
  parameters: JSON.stringify({
    spaces: [{ positions: routePoints([...polygon, polygon[0]], 100) }],
  }),
  isTemplate: 'YES',
  isThird: 'NO',
})

/** 航线模板演示数据 - 基于演习脚本和包头地理位置信息提取 */
export const DEMO_WAYLINE_TEMPLATES: API_AIRLINE.domain.AIRLINE_TEMPLATE[] = [
  makeWayline(
    9101,
    '机场区域日常巡逻航线',
    WaylineEnum.PointWayline,
    routePoints(
      [
        BAOTOU_POINTS.smallUavTakeoff,
        BAOTOU_POINTS.audienceStand,
        BAOTOU_POINTS.targetStrike,
        BAOTOU_POINTS.smallUavTakeoff,
      ],
      100,
    ),
  ),
  makeSwarmWayline(9102, 'B区域五机协同侦察航线', SMALL_UAV_AREA, 5),
  makeWayline(
    9103,
    'A目标打击航线',
    WaylineEnum.PointWayline,
    routePoints(
      [
        BAOTOU_POINTS.smallUavTakeoff,
        [109.59196, 40.87422],
        BAOTOU_POINTS.targetStrike,
      ],
      80,
    ),
  ),
  makeWayline(
    9104,
    'A目标二次打击航线',
    WaylineEnum.PointWayline,
    routePoints(
      [
        BAOTOU_POINTS.smallUavTakeoff,
        [109.59162, 40.87405],
        BAOTOU_POINTS.targetStrike,
      ],
      80,
    ),
  ),
  makeWayline(
    9105,
    'A目标机器狗侦察航线',
    WaylineEnum.PointWayline,
    routePoints(
      [
        BAOTOU_POINTS.smallUavTakeoff,
        [109.59218, 40.87422],
        BAOTOU_POINTS.targetStrike,
        [109.59158, 40.87402],
      ],
      30,
    ),
  ),
  makeWayline(
    9106,
    'C区域侦察航线',
    WaylineEnum.PointWayline,
    routePoints(
      [
        BAOTOU_POINTS.cy9aReconStart,
        C_OPERATION_AREA[0],
        C_OPERATION_AREA[1],
        C_OPERATION_AREA[2],
        C_OPERATION_AREA[3],
        BAOTOU_POINTS.cy9aReconStart,
      ],
      200,
    ),
  ),
  makeWayline(
    9107,
    '跟踪目标打击航线',
    WaylineEnum.PointWayline,
    routePoints(
      [
        BAOTOU_POINTS.cy9aReconStart,
        [109.5665, 40.8738],
        BAOTOU_POINTS.targetStrike,
      ],
      180,
    ),
  ),
]

/** 航线文件夹演示数据 */
export const DEMO_WAYLINE_FOLDERS: API_AIRLINE.domain.WaylineFolderTreeNode[] =
  [
    {
      id: 1,
      parentId: 0,
      folderName: '演示航线库',
      gmtCreate: '2026-07-06 10:00:00',
      gmtModified: '2026-07-06 10:00:00',
      gmtCreateBy: 'demo',
      gmtModifiedBy: 'demo',
      children: [],
    },
  ]

const WAYLINE_TEMPLATE_MAP = new Map(
  DEMO_WAYLINE_TEMPLATES.map((wayline) => [wayline.waylineTemplateId, wayline]),
)

/** 获取演示航线模板 */
const getDemoWayline = (waylineTemplateId: number) =>
  WAYLINE_TEMPLATE_MAP.get(waylineTemplateId)!

/** 组装任务中的航线配置快照 */
const makeTaskTemplateInfo = (
  wayline: API_AIRLINE.domain.AIRLINE_TEMPLATE,
) =>
  JSON.stringify({
    templateId: wayline.templateId,
    waylineTemplateId: wayline.waylineTemplateId,
    templateName: wayline.taskName,
    waylineType: wayline.taskType,
    taskBasic: wayline.taskBasic,
    parameters: JSON.parse(wayline.parameters),
  })

/** 组装行动子任务 */
const makeActionItem = (
  actionId: number,
  actionItemName: string,
  device: {
    id: string
    name: string
    type: string
  },
  waylineTemplateId: number,
  status: string,
  description: string,
  gmtCreate: string,
  options: Partial<API_ACTION_ITEM.domain.ActionItem> = {},
): API_ACTION_ITEM.domain.ActionItem => {
  const wayline = getDemoWayline(waylineTemplateId)

  return {
    id: actionId * 100 + 1,
    actionId,
    actionItemName,
    actionType: 'NO_SMART',
    deviceId: device.id,
    deviceName: device.name,
    deviceType: device.type,
    status,
    description,
    gmtCreate,
    gmtCreateBy: 'demo',
    taskTplId: String(wayline.waylineTemplateId),
    templateId: wayline.templateId,
    taskTemplateInfo: makeTaskTemplateInfo(wayline),
    extra: JSON.stringify({}),
    ...options,
  }
}

const B_AREA_SWARM_GROUP = {
  actionItemGroupId: 'rw-9001-b-swarm',
  actionItemGroupName: 'B区域五机协同侦察任务',
  actionItemGroupType: 'cluster',
}

/** 行动子任务（ActionItem）演示数据 - 一个 RW 对应一个任务，集群 RW 下发后拆分设备执行子任务。 */
export const DEMO_ACTION_ITEMS: Record<
  number,
  API_ACTION_ITEM.domain.ActionItem[]
> = {
  9001: [
    makeActionItem(
      9001,
      '机场区域日常巡逻任务',
      {
        id: DEMO_DEVICE_IDS.ziyanF15,
        name: '紫燕 F15',
        type: 'uav',
      },
      9101,
      'PROCESSING',
      '紫燕F15执行机场区域日常巡逻，控制光电球完成重点区域观察。',
      '2026-07-07 08:30:00',
      { id: 900101, flightHeight: 100, returnHeight: 120 },
    ),
    makeActionItem(
      9001,
      'B区域五机协同侦察-DJI M400',
      {
        id: DEMO_DEVICE_IDS.m400,
        name: 'DJI M400',
        type: 'uav',
      },
      9102,
      'PROCESSING',
      'DJI M400执行B区域五机协同侦察中的主侦察任务。',
      '2026-07-07 09:00:00',
      {
        id: 900102,
        flightHeight: 100,
        returnHeight: 120,
        extra: JSON.stringify({
          ...B_AREA_SWARM_GROUP,
          swarmIndex: 1,
          swarmTotal: 5,
        }),
      },
    ),
    makeActionItem(
      9001,
      'B区域五机协同侦察-DJI M300-01',
      {
        id: DEMO_DEVICE_IDS.m300A,
        name: 'DJI M300-01',
        type: 'uav',
      },
      9102,
      'PROCESSING',
      'DJI M300-01承担B区域东侧分区侦察任务。',
      '2026-07-07 09:00:00',
      {
        id: 900103,
        flightHeight: 100,
        returnHeight: 120,
        extra: JSON.stringify({
          ...B_AREA_SWARM_GROUP,
          swarmIndex: 2,
          swarmTotal: 5,
        }),
      },
    ),
    makeActionItem(
      9001,
      'B区域五机协同侦察-DJI M300-02',
      {
        id: DEMO_DEVICE_IDS.m300B,
        name: 'DJI M300-02',
        type: 'uav',
      },
      9102,
      'PROCESSING',
      'DJI M300-02承担B区域西侧分区侦察任务。',
      '2026-07-07 09:00:00',
      {
        id: 900104,
        flightHeight: 100,
        returnHeight: 120,
        extra: JSON.stringify({
          ...B_AREA_SWARM_GROUP,
          swarmIndex: 3,
          swarmTotal: 5,
        }),
      },
    ),
    makeActionItem(
      9001,
      'B区域五机协同侦察-DJI 30T-01',
      {
        id: DEMO_DEVICE_IDS.dji30tA,
        name: 'DJI 30T-01',
        type: 'uav',
      },
      9102,
      'PROCESSING',
      'DJI 30T-01承担B区域南侧精细成像侦察任务。',
      '2026-07-07 09:00:00',
      {
        id: 900105,
        flightHeight: 100,
        returnHeight: 120,
        extra: JSON.stringify({
          ...B_AREA_SWARM_GROUP,
          swarmIndex: 4,
          swarmTotal: 5,
        }),
      },
    ),
    makeActionItem(
      9001,
      'B区域五机协同侦察-DJI 30T-02',
      {
        id: DEMO_DEVICE_IDS.dji30tB,
        name: 'DJI 30T-02',
        type: 'uav',
      },
      9102,
      'PROCESSING',
      'DJI 30T-02承担B区域北侧精细成像侦察任务。',
      '2026-07-07 09:00:00',
      {
        id: 900106,
        flightHeight: 100,
        returnHeight: 120,
        extra: JSON.stringify({
          ...B_AREA_SWARM_GROUP,
          swarmIndex: 5,
          swarmTotal: 5,
        }),
      },
    ),
    makeActionItem(
      9001,
      'A目标打击任务',
      {
        id: DEMO_DEVICE_IDS.m350,
        name: 'DJI M350',
        type: 'uav',
      },
      9103,
      'FINISHED',
      'DJI M350前出至A目标区域，按预设流程执行打击任务。',
      '2026-07-07 09:30:00',
      { id: 900107, flightHeight: 80, returnHeight: 120 },
    ),
    makeActionItem(
      9001,
      'A目标二次打击任务',
      {
        id: DEMO_DEVICE_IDS.m350,
        name: 'DJI M350',
        type: 'uav',
      },
      9104,
      'FINISHED',
      'DJI M350再次前出至A目标区域，按预设流程执行复击任务。',
      '2026-07-07 10:00:00',
      { id: 900108, flightHeight: 80, returnHeight: 120 },
    ),
    makeActionItem(
      9001,
      'A目标机器狗侦察任务',
      {
        id: DEMO_DEVICE_IDS.robotDog,
        name: '机器狗-01',
        type: 'robot',
      },
      9105,
      'PROCESSING',
      '机器狗从小无人机起飞点附近出发，对A目标周边实施递进侦察并采集现场图像。',
      '2026-07-07 10:30:00',
      { id: 900109, flightHeight: 30, returnHeight: 30 },
    ),
  ],
  9002: [
    makeActionItem(
      9002,
      'C区域侦察任务',
      {
        id: DEMO_DEVICE_IDS.cy9a,
        name: 'CY-9A',
        type: 'uav',
      },
      9106,
      'PROCESSING',
      'CY-9A沿预设航线前往C区域侦察目标起始点，对整体作业区域展开远域侦察。',
      '2026-07-07 11:00:00',
      { id: 900201, flightHeight: 200, returnHeight: 200 },
    ),
    makeActionItem(
      9002,
      '跟踪目标打击任务',
      {
        id: DEMO_DEVICE_IDS.cy9a,
        name: 'CY-9A',
        type: 'uav',
      },
      9107,
      'PENDING',
      'CY-9A接收打击任务，对持续跟踪目标实施空地导弹打击。',
      '2026-07-07 11:30:00',
      { id: 900202, flightHeight: 180, returnHeight: 200 },
    ),
  ],
}
