export type ConfigType = GlobalConfig

type WindowType = Window & { config: ConfigType }

/** 全局配置 window.config */
let globalConfig = (window as unknown as WindowType).config

// 根据端口合并配置
const port = location.port
if (globalConfig[port]) {
  globalConfig = { ...globalConfig, ...globalConfig[port] }
  ;(window as unknown as WindowType).config = globalConfig
}

if (import.meta.env.DEV && __DEV_MERGE_CONFIG__) {
  Object.assign(globalConfig, __DEV_MERGE_CONFIG__)
}

globalConfig.loginUrl ??= `${globalConfig.loginHttps ? 'https' : 'http'}://${
  location.hostname
}:32712/login`

globalConfig.uavHeightLimit ??= 1000

globalConfig.mcps ??= {}
globalConfig.enableJessibucaMetrics ??= false
globalConfig.defaultTheme ??= 'dark'
globalConfig.env ??= 'default'
globalConfig.useDeviceTreeV4 ??= false
globalConfig.actionTypeIncludes ??= []
globalConfig.useShanghaiHongqiaoAirportElevation ??= false

class GlobalConfig {
  systemName = 'jingqi'
  title = '牍术·无人装备智能引擎'
  env?: string
  loginUrl?: string
  version?: string
  globalWs = 'ws'
  videoBuffer?: number
  loginHttps?: boolean
  videoBufferDelay?: number
  videoProxy?: boolean
  disableZoomHeight?: number
  defaultMapUrl?: string
  defaultImageries?: {
    url: string
    min: number
    max: number
    crs?: string
    cacheOption?: {
      ver: number
      staleDays?: number
    }
  }[]
  logo?: string
  enableElectricScale?: boolean
  vodVideoUrl?: string
  /** 道通服务 */
  daotongServer?: string
  /** 告警提示音 */
  warnAudioUrl?: string
  controlRoom?: {
    uav?: {
      particularHeader?: boolean
    }
  }
  /** 无人机高度限制 */
  uavHeightLimit = 1000
  isHaveBacktracking?: boolean
  /** 地形服务 */
  terrainUrl?: string
  /** 是否使用地形 */
  useTerrain?: boolean
  /** 是否开启上海虹桥机场高程 */
  useShanghaiHongqiaoAirportElevation?: boolean
  /** 杭州禁飞区 */
  useHangzhouBanAreas?: boolean
  /** 贵州自定义 */
  useGuizhouFarm?: boolean
  /** 贵州项目点位 */
  useGuizhouProjects?: boolean
  intelligentPhotographVersion?: number
  intelligentPhotographV1Filter?: string[]
  /** 是否 72 */
  is72?: boolean
  /** 是否滨州演示 */
  isBinzhou?: boolean
  isXiaoshan?: boolean

  /** minio */
  bucketName: undefined

  /** 是否使用一机一档 */
  useUavAirportDoc?: boolean | undefined

  /** 是否使用一机一档上传 */
  useUavAirportDocUpload?: boolean | undefined

  /** 是否使用无人机日志 */
  useUavLogs?: boolean | undefined

  /** 是否启用飞行报备 */
  useFlightReporting?: boolean

  /** 访问密钥 */
  accessKeyId?: string
  /** 访问密钥 */
  secretAccessKey?: string

  mcps?: Record<string, string>
  /** 是否启用 jessibuca 监控上报 */
  enableJessibucaMetrics?: boolean
  /** Sentry dsn */
  sentryDsn?: string
  /** Sentry project id */
  sentryProjectId?: string
  /** Tanqi */
  useTanqi?: boolean
  useFlight3D?: boolean
  robotDogMap?: 'point-cloud' | 'wgs84'
  /** 默认主题色 */
  defaultTheme: string = 'dark'
  /** 是否使用 V4 设备树接口 */
  useDeviceTreeV4?: boolean

  /** 包含行动类型（为空数组表示不过滤） */
  actionTypeIncludes?: string[]

  // 是否开启喊话器音频上传功能
  usePayloadP3Upload: boolean = false

  useRelayDevice: boolean = true

  useMaintenanceStatusSwitch: boolean = false

  /** 禁飞区显示样式: 'default' 为默认样式(红色填充), 'fence' 为电子围栏样式 */
  noFlyZoneDisplayStyle?: 'default' | 'fence'

  /** 是否隐藏 2D 重建操作 */
  hideReconstruction2DRebuild?: boolean

  /** 是否隐藏 2D 重建删除操作 */
  hideReconstruction2DDelete?: boolean

  /** 是否开启蛙跳任务 */
  enableFrogLeapTask = false

  /** 是否为新系统配置 */
  isNewSystemConfig: boolean = false

  /** 道通接口返回采用Intranet */
  daotongIntranet?: boolean = false

  constructor(def: ConfigType) {
    Object.assign(this, def)
  }
  merge(configs: ConfigType) {
    Object.assign(this, configs)
  }
}

const config = new GlobalConfig(globalConfig)

export default config
