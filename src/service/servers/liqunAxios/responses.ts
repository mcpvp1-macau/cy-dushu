import { AxiosResponse } from 'axios'

export interface Responses<T> {
  ['axios']: AxiosResponse<T> // axios原始响应类型
  ['any']: { [key: string]: any } // any类型
  ['T']: T // 直接覆盖方式
  ['common']: { code: string; message: string; data: T } // 常用响应类型
  ['ditingTanqi']: {
    success: boolean
    message?: string
    data: T
  }
  ['dbApi']: { success: boolean; data: T | null; msg?: string } // DBAPI 接口数据类型
  // 其他自定义的响应类型加载后面 ...
}

// 下面是 类型缩小 的工具函数, 一般用于 catch 后的类型判断, 用于区别于非成功的响应

/** 判断是否为 common 类型的错误 */
export const isLiqunCommonError = (
  resp: any,
): resp is { code: string; message: string; data: any } => {
  return resp.code !== undefined
}

/** 判断是否为 dbAPI 类型的错误 */
export const isLiqunDbApiError = (
  resp: any,
): resp is { success: boolean; data: any[] | null; msg?: string } => {
  return resp.success !== undefined
}
