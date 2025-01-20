import useUserStore from '@/store/useUser.store'
import { message } from 'antd'
import {
  AxiosError,
  AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { LiqunAxiosRequestConfig } from './liqunAxios'
import { msgMitt } from '@/hooks/useAppMsg'
import i18n from '@/langs/i18n'

const acceptLanguageMap = new Map<string, string>([
  ['zh', 'zh-CN'],
  ['en', 'en-US'],
])

/** 国际化 */
export const withInternational = (config: InternalAxiosRequestConfig<any>) => {
  config.headers['Accept-Language'] = acceptLanguageMap.get(i18n.language)
  return config
}

/** token 携带 */
export const withToken = (config: InternalAxiosRequestConfig<any>) => {
  const { token } = useUserStore.getState()
  config.headers['_origin_target_host'] = location.host
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}

const codes = [
  'NOT LOGIN',
  'LOGIN TIMEOUT',
  'PERIOD OF VALIDITY TIMEOUT',
  'OTHER LOGINED',
]

/** 未授权判断 */
export const unAuthorized = (resp: AxiosResponse | AxiosError) => {
  if ('isAxiosError' in resp) {
    resp = resp.response as AxiosResponse
  }
  const isUnAuthorized = resp.status === 401 || codes.includes(resp.data.code)
  if (!isUnAuthorized) {
    return resp
  }
  // 未登录 跳转路由 login
  if (resp.data.message) {
    message.error(resp.data.message)
  }
  useUserStore.getState().logout()

  return resp
}

export const shouldShowError = (resp: any) => {
  const xCustomConfig =
    (resp.config as any as LiqunAxiosRequestConfig<any>)?.xCustomConfig ?? {}
  if (
    xCustomConfig?.autoShowMessageOnNotSuccess !== false &&
    resp.data?.message
  ) {
    const prefix = xCustomConfig.msgPrefix ? `${xCustomConfig.msgPrefix}: ` : ''
    msgMitt.emit('open', {
      type: 'error',
      content: `${prefix}${resp.data.message}`,
    })
  }
}
