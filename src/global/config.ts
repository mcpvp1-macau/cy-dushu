export type ConfigType = {
  systemName: string
  title: string
  loginUrl: string
  globalWs: string
  videoBuffer?: number
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
}

type WindowType = Window & { config: ConfigType }

/** 全局配置 window.config */
const globalConfig = (window as unknown as WindowType).config

if (import.meta.env.DEV && __DEV_MERGE_CONFIG__) {
  Object.assign(globalConfig, __DEV_MERGE_CONFIG__)
}

globalConfig.loginUrl ??= `http://${location.hostname}:32712`

export default globalConfig
