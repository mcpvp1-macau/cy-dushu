/** 解析JSON, 在解析失败时, 不报错, 返回 undefined */
export const shouldJson = <T = any>(content: any): T | undefined => {
  if (typeof content !== 'string') {
    return content
  }
  try {
    return JSON.parse(content)
  } catch (e) {}
  return undefined
}
