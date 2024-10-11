/**
 * 限制数字范围
 * @param num 数值
 * @param min 最小值
 * @param max 最大值
 * @returns
 */
export const limitNum = (num: number, min: number, max: number) => {
  return Math.min(Math.max(num, min), max);
};
