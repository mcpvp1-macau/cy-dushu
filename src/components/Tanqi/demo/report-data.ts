/**
 * 檀棋演示报告数据（纯前端 Mock）
 * 四类报告: 任务规划(RW) / 态势报告(TS) / 毁伤报告(HS) / 作战评估(PG)
 */

export type TanqiReportType =
  | 'task'
  | 'situation'
  | 'damage'
  | 'evaluation'
  | 'inventory'

export type TanqiReport = {
  type: TanqiReportType
  /** 卡片标题 */
  title: string
  /** 报告编号 */
  reportNo?: string
  /** 键值信息 */
  meta?: [string, string][]
  /** 表格 */
  tables?: { title?: string; headers: string[]; rows: string[][] }[]
  /** 分段内容 */
  sections?: { title: string; items: string[] }[]
  /** 结论/建议 */
  conclusion?: string
}

export const REPORT_TYPE_CONFIG: Record<
  TanqiReportType,
  { label: string; badge: string }
> = {
  task: { label: '任务规划', badge: '任务' },
  situation: { label: '态势报告', badge: '态势' },
  damage: { label: '毁伤报告', badge: '毁伤' },
  evaluation: { label: '作战评估', badge: '评估' },
  inventory: { label: '装备清单', badge: '清单' },
}

const dateNo = () => dayjs().format('YYYYMMDD')

/** 无人装备清单 */
export const inventoryReport = (): TanqiReport => ({
  type: 'inventory',
  title: '无人装备清单',
  tables: [
    {
      title: '无人装备类型、数量和对应角色',
      headers: ['序号', '装备名称', '类型', '数量', '角色'],
      rows: [
        ['1', 'DJI M400', '多旋翼无人机', '1', '侦察'],
        ['2', 'DJI M350', '多旋翼无人机', '2', '打击'],
        ['3', 'DJI M300', '多旋翼无人机', '2', '侦察'],
        ['4', 'DJI 30T', '多旋翼无人机', '2', '侦察'],
        ['5', '紫燕 F15', '直升机', '1', '侦察'],
        ['6', 'CY-9A', '固定翼', '1', '察打一体'],
        ['7', 'HY-3', '垂起固定翼', '1', '侦察'],
        ['8', '机器狗', '机器狗', '1', '侦察'],
      ],
    },
  ],
})

/** 任务规划报告 */
export const taskReport = (): TanqiReport => ({
  type: 'task',
  title: '侦察任务',
  reportNo: `RW-${dateNo()}-01`,
  meta: [
    ['任务类型/目标', '侦察任务'],
    ['任务区域', 'B 区域（四点坐标）'],
  ],
  tables: [
    {
      title: '使用装备与任务时间',
      headers: ['序号', '装备名称', '类型', '数量', '飞行速度', '角色', '状态', '时序'],
      rows: [
        ['1', 'DJI M400', '多旋翼无人机', '1', '10m/s', '侦察', '待机', '即刻起飞'],
        ['2', 'DJI M300', '多旋翼无人机', '2', '10m/s', '侦察', '待机', '即刻起飞'],
        ['3', 'DJI 30T', '多旋翼无人机', '2', '10m/s', '侦察', '待机', '即刻起飞'],
      ],
    },
  ],
  conclusion: '航线已生成并完成推演与冲突消除，确认后可下发至指定装备执行。',
})

/** 打击任务规划报告 */
export const strikeTaskReport = (): TanqiReport => ({
  type: 'task',
  title: '打击任务',
  reportNo: `RW-${dateNo()}-02`,
  meta: [
    ['任务类型', '打击任务'],
    ['任务区域/目标', 'A 目标（跟踪中）'],
  ],
  tables: [
    {
      title: '使用装备与任务时间',
      headers: ['序号', '装备名称', '类型', '数量', '角色', '状态', '时序'],
      rows: [['1', 'DJI M350', '多旋翼无人机', '1', '打击', '待机', '立即执行']],
    },
  ],
  conclusion: '单机打击航线已生成，确认后直接下发执行。',
})

/** 态势分析报告 */
export const situationReport = (): TanqiReport => ({
  type: 'situation',
  title: '态势分析报告',
  reportNo: `TS-${dateNo()}-01`,
  meta: [
    ['作业任务', '精细侦察'],
    ['情报来源', 'DJI M400、DJI M300、DJI 30T'],
  ],
  sections: [
    {
      title: '前期侦察概况',
      items: [
        '本次使用 5 架机对 B 区域展开精细化侦察，发现敌方车辆 1 辆、非法作业人员 2 人，目前已驱车逃跑，无人机正在对目标进行稳定跟踪。',
      ],
    },
    {
      title: '当前态势研判',
      items: [
        '风险分析：目标已明确为敌方非法入侵车辆，并在我方保护区域开展非法作业。',
        '情报获取分析：已确认车辆 1 辆、人员 2 人，正在驱车逃逸，无人机持续获取目标坐标与图像。',
        '综合研判：敌方目标明确、位置已知，可能携带重要侦察情报逃离，我方打击装备可执行拦截打击。',
      ],
    },
    {
      title: '下一步行动建议',
      items: ['建议派出 M350 打击无人机对其进行毁伤打击。'],
    },
  ],
  tables: [
    {
      title: '我方装备分析',
      headers: ['序号', '装备名称', '类型', '数量', '角色', '当前状态'],
      rows: [
        ['1', 'DJI M400', '多旋翼无人机', '1', '侦察', '任务中'],
        ['2', 'DJI M350', '多旋翼无人机', '2', '打击', '待机'],
        ['3', 'DJI M300', '多旋翼无人机', '2', '侦察', '任务中'],
        ['4', 'DJI 30T', '多旋翼无人机', '2', '侦察', '任务中'],
        ['5', '紫燕 F15', '直升机', '1', '侦察', '任务中'],
        ['6', 'CY-9A', '固定翼', '1', '察打一体', '任务中'],
        ['7', 'HY-3', '垂起固定翼', '1', '侦察', '待机'],
      ],
    },
  ],
})

/** 毁伤评估报告 */
export const damageReport = (): TanqiReport => ({
  type: 'damage',
  title: 'B 目标毁伤评估',
  reportNo: `HS-${dateNo()}-01`,
  meta: [
    ['作业任务', '打击任务'],
    ['打击目标', 'B 目标'],
    ['目标类型', '车辆'],
    ['打击方式', '抛投手雷'],
    ['打击次数', '2 次'],
  ],
  sections: [
    {
      title: '打击效果',
      items: [
        '本次打击命中目标，使敌方车辆停止，车辆完全丧失行动能力，人员已失去行动能力。',
      ],
    },
  ],
  conclusion: '下一步行动建议：无。',
})

/** 作战效能评估报告 */
export const evaluationReport = (): TanqiReport => ({
  type: 'evaluation',
  title: '作战效能评估',
  reportNo: `PG-${dateNo()}-01`,
  sections: [
    {
      title: '作战概况',
      items: [
        '作战次数 3 次：第一次日常巡逻；第二次区域内部侦察与打击；第三次远域侦察打击。',
        '3 次任务共出动 7 型无人装备，执行任务与规划形式一致。',
      ],
    },
  ],
  tables: [
    {
      title: '出动装备',
      headers: ['序号', '装备名称', '类型', '数量', '角色', '分配任务'],
      rows: [
        ['1', 'DJI M400', '多旋翼无人机', '1', '侦察', '任务2'],
        ['2', 'DJI M350', '多旋翼无人机', '2', '打击', '任务2'],
        ['3', 'DJI M300', '多旋翼无人机', '2', '侦察', '任务2'],
        ['4', 'DJI 30T', '多旋翼无人机', '2', '侦察', '任务2'],
        ['5', '紫燕 F15', '直升机', '1', '侦察', '任务1'],
        ['6', 'CY-9A', '固定翼', '1', '察打一体', '任务3'],
        ['7', '机器狗', '机器狗', '1', '侦察', '任务2'],
      ],
    },
    {
      title: '打击目标与次数',
      headers: ['序号', '打击目标', '打击次数', '使用装备', '使用武器', '打击结果'],
      rows: [
        ['1', '车辆（坐标）', '2', 'M350', '抛投弹药', '毁伤'],
        ['2', '车辆（坐标）', '1', 'CY-9A', '空地导弹', '毁伤'],
      ],
    },
    {
      title: '可靠性评估',
      headers: ['序号', '装备名称', '故障情况', '链路中断次数', '丢包率', '角色'],
      rows: [
        ['1', 'DJI M400', '良好', '0', '1%', '侦察'],
        ['2', 'DJI M350', '良好', '0', '0', '打击'],
        ['3', 'DJI M300', '良好', '0', '0', '侦察'],
        ['4', 'DJI 30T', '良好', '0', '0', '侦察'],
        ['5', '紫燕 F15', '良好', '0', '1%', '侦察'],
        ['6', 'CY-9A', '良好', '0', '0', '察打一体'],
        ['7', '机器狗', '良好', '0', '0', '侦察'],
      ],
    },
  ],
  conclusion:
    '执行任务期间装备未出现故障，链路工作良好，未发生中断情况。本次行动共打击 2 个目标，均已完成毁伤任务。',
})

/** 根据报告类型获取报告 */
export const getReportByType = (type: TanqiReportType): TanqiReport => {
  switch (type) {
    case 'task':
      return taskReport()
    case 'situation':
      return situationReport()
    case 'damage':
      return damageReport()
    case 'evaluation':
      return evaluationReport()
    default:
      return inventoryReport()
  }
}

/** 根据用户输入内容匹配报告类型 */
export const matchReportType = (message: string): TanqiReportType | null => {
  if (/毁伤|评估打击|打击效果/.test(message)) return 'damage'
  if (/态势|研判|分析报告/.test(message)) return 'situation'
  if (/效能|总结|汇总|复盘/.test(message)) return 'evaluation'
  if (/任务|侦察|打击|规划|方案|航线/.test(message)) return 'task'
  if (/装备|清单/.test(message)) return 'inventory'
  return null
}
