/** 规范化行动类型查询参数为逗号分隔字符串。 */
const normalizeActionType = (
  value?: string | string[] | number | number[] | null,
) => {
  if (value === null || value === undefined) {
    return undefined
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(',')
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return value
}

export default normalizeActionType
