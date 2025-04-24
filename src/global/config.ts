export type ConfigType = {
  systemName: string
  title: string
  loginUrl?: string
  version?: string
  globalWs: string
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
  uavHeightLimit: number
  isHaveBacktracking?: boolean
  /** 地形服务 */
  terrainUrl?: string
  /** 是否使用地形 */
  useTerrain?: boolean
  useShanghaiBanRoutes?: boolean
}

type WindowType = Window & { config: ConfigType }

/** 全局配置 window.config */
const globalConfig = (window as unknown as WindowType).config

if (import.meta.env.DEV && __DEV_MERGE_CONFIG__) {
  Object.assign(globalConfig, __DEV_MERGE_CONFIG__)
}

globalConfig.loginUrl ??= `${globalConfig.loginHttps ? 'https' : 'http'}://${
  location.hostname
}:32712/login`

globalConfig.uavHeightLimit ??= 1000

export default globalConfig
