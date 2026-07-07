import { DEMO_FLEET_CENTER } from '@/demo/fixed-wing/constants'
import { WaylineEnum } from '@/constant/uav/wayline'

const { longitude: LNG, latitude: LAT } = DEMO_FLEET_CENTER

/** 行动列表演示数据 - 基于异构试验脚本提取的作战任务（RW） */
export const DEMO_ACTIONS: API_ACTION.domain.ActionRecord[] = [
  {
    id: 9001,
    actionId: 9001,
    name: 'A目标打击任务',
    status: 'PROCESSING',
    eventId: '',
    startTime: '2026-07-07 08:30:00',
    type: 'normal',
    endTime: '',
    gmtCreate: '2026-07-07 08:30:00',
    gmtModified: '2026-07-07 08:30:00',
    gmtCreateBy: 'demo',
    gmtModifiedBy: 'demo',
    description: 'DJI M350 前出对A目标车辆进行打击，抛投手雷1次，命中目标，毁伤程度中，残余作战能力丧失部分能力',
  },
  {
    id: 9002,
    actionId: 9002,
    name: 'A目标二次打击任务',
    status: 'PROCESSING',
    eventId: '',
    startTime: '2026-07-07 09:15:00',
    type: 'normal',
    endTime: '',
    gmtCreate: '2026-07-07 09:15:00',
    gmtModified: '2026-07-07 09:15:00',
    gmtCreateBy: 'demo',
    gmtModifiedBy: 'demo',
    description: 'DJI M350 对A目标车辆进行二次打击，抛投手雷1次，命中目标，毁伤程度高，残余作战能力完全丧失',
  },
  {
    id: 9003,
    actionId: 9003,
    name: 'A目标机器狗侦察任务',
    status: 'PROCESSING',
    eventId: '',
    startTime: '2026-07-07 09:45:00',
    type: 'normal',
    endTime: '',
    gmtCreate: '2026-07-07 09:45:00',
    gmtModified: '2026-07-07 09:45:00',
    gmtCreateBy: 'demo',
    gmtModifiedBy: 'demo',
    description: '派出机器狗进行递进侦察，查看敌方人员伤亡情况，获取现场图像后进行毁伤评估',
  },
  {
    id: 9004,
    actionId: 9004,
    name: 'C区域侦察任务',
    status: 'PROCESSING',
    eventId: '',
    startTime: '2026-07-07 10:30:00',
    type: 'normal',
    endTime: '',
    gmtCreate: '2026-07-07 10:30:00',
    gmtModified: '2026-07-07 10:30:00',
    gmtCreateBy: 'demo',
    gmtModifiedBy: 'demo',
    description: 'CY-9A对C区域进行远域侦察，发现敌方入侵车辆1辆，系统进行定位与目标识别，更新态势地图',
  },
  {
    id: 9005,
    actionId: 9005,
    name: '跟踪目标打击任务',
    status: 'PENDING',
    eventId: '',
    startTime: '',
    type: 'normal',
    endTime: '',
    gmtCreate: '2026-07-07 11:00:00',
    gmtModified: '2026-07-07 11:00:00',
    gmtCreateBy: 'demo',
    gmtModifiedBy: 'demo',
    description: 'CY-9A对C区域跟踪目标进行打击，使用空地导弹1次，命中目标，车辆完全丧失能力',
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
const point = (dx: number, dy: number, pointZ = 120, index = 0) => ({
  pointX: LNG + dx,
  pointY: LAT + dy,
  pointZ,
  index,
})

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
  polygon: number[][],
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
    // 主航向 45°
    mainK: Math.tan((45 * Math.PI) / 180),
    coverage: 70,
    // 蜂群飞机数量
    droneCount,
  }),
  parameters: JSON.stringify({}),
  isTemplate: 'YES',
  isThird: 'NO',
})

/** 航线模板演示数据 - 基于异构试验脚本提取的作战任务航线 */
export const DEMO_WAYLINE_TEMPLATES: API_AIRLINE.domain.AIRLINE_TEMPLATE[] = [
  // 五机蜂群区域覆盖航线（包头演示方案）
  makeSwarmWayline(
    9104,
    '五机蜂群区域覆盖航线',
    [
      [LNG - 0.012, LAT - 0.009],
      [LNG + 0.012, LAT - 0.009],
      [LNG + 0.012, LAT + 0.009],
      [LNG - 0.012, LAT + 0.009],
    ],
    5,
  ),
  // A目标打击任务航线 - DJI M350
  makeWayline(9101, 'A目标打击航线', WaylineEnum.PointWayline, [
    point(-0.005, -0.003, 80),
    point(0, 0, 80),
    point(0.005, 0.003, 80),
  ]),
  // A目标二次打击航线 - DJI M350
  makeWayline(9102, 'A目标二次打击航线', WaylineEnum.PointWayline, [
    point(-0.006, -0.004, 75),
    point(0, 0, 75),
    point(0.006, 0.004, 75),
  ]),
  // A目标机器狗侦察航线
  makeWayline(9103, 'A目标机器狗侦察航线', WaylineEnum.PointWayline, [
    point(-0.003, -0.002, 30),
    point(0, 0, 30),
    point(0.003, 0.002, 30),
    point(0.002, -0.001, 30),
  ]),
  // C区域侦察任务航线 - CY-9A
  makeWayline(9105, 'C区域侦察航线', WaylineEnum.PointWayline, [
    point(-0.015, -0.01, 200),
    point(-0.005, -0.005, 200),
    point(0.005, 0.005, 200),
    point(0.015, 0.01, 200),
    point(0.01, 0, 200),
  ]),
  // 跟踪目标打击航线 - CY-9A
  makeWayline(9106, '跟踪目标打击航线', WaylineEnum.PointWayline, [
    point(0.01, 0, 180),
    point(0.005, 0.005, 180),
    point(0, 0, 180),
  ]),
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

/** 行动子任务（ActionItem）演示数据 - 基于异构试验脚本提取的作战任务详情 */
export const DEMO_ACTION_ITEMS: Record<
  number,
  API_ACTION_ITEM.domain.ActionItem[]
> = {
  9001: [
    {
      id: 900101,
      actionId: 9001,
      actionItemName: 'A目标打击-无人机前出',
      actionType: 'NO_SMART',
      deviceId: 'uav-m350-001',
      deviceName: 'DJI M350',
      deviceType: 'uav',
      status: 'FINISHED',
      description: 'DJI M350 前出对A目标车辆进行打击',
      gmtCreate: '2026-07-07 08:30:00',
      gmtCreateBy: 'demo',
      taskTemplateInfo: JSON.stringify({
        templateId: '9101',
        templateName: 'A目标打击航线',
      }),
      extra: JSON.stringify({}),
    },
  ],
  9002: [
    {
      id: 900201,
      actionId: 9002,
      actionItemName: 'A目标二次打击-无人机前出',
      actionType: 'NO_SMART',
      deviceId: 'uav-m350-001',
      deviceName: 'DJI M350',
      deviceType: 'uav',
      status: 'FINISHED',
      description: 'DJI M350 对A目标车辆进行二次打击',
      gmtCreate: '2026-07-07 09:15:00',
      gmtCreateBy: 'demo',
      taskTemplateInfo: JSON.stringify({
        templateId: '9102',
        templateName: 'A目标二次打击航线',
      }),
      extra: JSON.stringify({}),
    },
  ],
  9003: [
    {
      id: 900301,
      actionId: 9003,
      actionItemName: 'A目标机器狗侦察',
      actionType: 'NO_SMART',
      deviceId: 'robot-dog-001',
      deviceName: '机器狗',
      deviceType: 'robot',
      status: 'PROCESSING',
      description: '派出机器狗进行递进侦察，查看敌方人员伤亡情况',
      gmtCreate: '2026-07-07 09:45:00',
      gmtCreateBy: 'demo',
      taskTemplateInfo: JSON.stringify({
        templateId: '9103',
        templateName: 'A目标机器狗侦察航线',
      }),
      extra: JSON.stringify({}),
    },
  ],
  9004: [
    {
      id: 900401,
      actionId: 9004,
      actionItemName: 'C区域侦察-CY-9A前出',
      actionType: 'NO_SMART',
      deviceId: 'uav-cy9a-001',
      deviceName: 'CY-9A',
      deviceType: 'uav',
      status: 'PROCESSING',
      description: 'CY-9A对C区域进行远域侦察，发现敌方入侵车辆',
      gmtCreate: '2026-07-07 10:30:00',
      gmtCreateBy: 'demo',
      taskTemplateInfo: JSON.stringify({
        templateId: '9105',
        templateName: 'C区域侦察航线',
      }),
      extra: JSON.stringify({}),
    },
  ],
  9005: [
    {
      id: 900501,
      actionId: 9005,
      actionItemName: '跟踪目标打击-CY-9A打击',
      actionType: 'NO_SMART',
      deviceId: 'uav-cy9a-001',
      deviceName: 'CY-9A',
      deviceType: 'uav',
      status: 'PENDING',
      description: 'CY-9A对C区域跟踪目标进行打击',
      gmtCreate: '2026-07-07 11:00:00',
      gmtCreateBy: 'demo',
      taskTemplateInfo: JSON.stringify({
        templateId: '9106',
        templateName: '跟踪目标打击航线',
      }),
      extra: JSON.stringify({}),
    },
  ],
}
