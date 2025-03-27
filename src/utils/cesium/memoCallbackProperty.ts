import { CallbackProperty } from 'cesium'

export const makeMemoCallbackProperty = (
  callback: CallbackProperty.Callback,
  isConstant: boolean = false,
  deps: () => any[],
) => {
  let lastDepts: any[] | null = null
  let lastRes: any = null

  return new CallbackProperty((time, result) => {
    const currentDepts = deps()

    // 值未发送变化，直接返回上次结果
    if (
      lastRes &&
      Array.isArray(lastDepts) &&
      lastDepts.every((dep, index) => dep === currentDepts[index])
    ) {
      return lastRes
    }

    lastDepts = currentDepts
    lastRes = callback(time, result)
    return lastRes
  }, isConstant)
}
