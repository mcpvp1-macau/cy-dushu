import axios from 'axios'
import type {
  AxiosInstance,
  CreateAxiosDefaults,
  AxiosRequestConfig,
} from 'axios'
import { Responses } from './responses'

export type XCustomConfig = {
  autoShowMessageOnNotSuccess?: boolean
  msgPrefix?: string
  [key: string]: any
}

export interface LiqunAxiosRequestConfig<T> extends AxiosRequestConfig<T> {
  xCustomConfig?: XCustomConfig
}

class LiqunAxios<R extends keyof Responses<void> = 'axios'> {
  private instance: AxiosInstance

  constructor(config: CreateAxiosDefaults) {
    this.instance = axios.create(config)
  }

  public get interceptors() {
    return this.instance.interceptors
  }

  public get baseURL() {
    return this.instance.defaults.baseURL
  }

  public request<T = any>(config: LiqunAxiosRequestConfig<any>) {
    return this.instance.request<T, Responses<T>[R]>(config)
  }

  public get<T = any>(url: string, config?: LiqunAxiosRequestConfig<any>) {
    return this.instance.get<T, Responses<T>[R]>(url, config)
  }

  public post<T = any, D = any>(
    url: string,
    data?: D,
    config?: LiqunAxiosRequestConfig<any>,
  ) {
    return this.instance.post<T, Responses<T>[R]>(url, data, config)
  }

  public patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: LiqunAxiosRequestConfig<any>,
  ) {
    return this.instance.patch<T, Responses<T>[R]>(url, data, config)
  }

  public put<T = any, D = any>(
    url: string,
    data?: D,
    config?: LiqunAxiosRequestConfig<any>,
  ) {
    return this.instance.put<T, Responses<T>[R]>(url, data, config)
  }

  public delete<T = any>(url: string, config?: LiqunAxiosRequestConfig<any>) {
    return this.instance.delete<T, Responses<T>[R]>(url, config)
  }

  public head<T = any>(url: string, config?: LiqunAxiosRequestConfig<any>) {
    return this.instance.head<T, Responses<T>[R]>(url, config)
  }

  public options<T = any>(url: string, config?: LiqunAxiosRequestConfig<any>) {
    return this.instance.options<T, Responses<T>[R]>(url, config)
  }
}

export default LiqunAxios
