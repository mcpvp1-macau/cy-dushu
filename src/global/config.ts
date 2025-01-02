export type ConfigType = {
  systemName: string
  title: string
  loginUrl?: string
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
  }[]
  logo?: string
  enableElectricScale?: boolean
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

export default globalConfig
