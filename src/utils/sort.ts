/** 返回第一个满足的元素 */
export const sortSearchFn = <T>(array: T[], fn: (e: T) => boolean) => {
  let low = 0,
    high = array.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (fn(array[mid])) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return low - 1;
};

export const sortSearchFnAsc = <T>(array: T[], fn: (e: T) => boolean) => {
  let low = 0,
    high = array.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (fn(array[mid])) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return high + 1;
};
