/** 合并两个根据时间戳 t 已排序的 */
export const mergeSortedArray = <T extends { t: number }>(a: T[], b: T[]) => {
  let i = 0,
    j = 0

  const n = a.length,
    m = b.length,
    res = [] as T[]

  while (i < n && j < m) {
    if (a[i].t === b[j].t) {
      res.push(a[i])
      i++
      j++
    } else if (a[i].t < b[j].t) {
      res.push(a[i])
      i++
    } else {
      res.push(b[j])
      j++
    }
  }
  if (i < n) {
    res.push(...a.slice(i))
  } else if (j < m) {
    res.push(...b.slice(j))
  }
  return res
}
