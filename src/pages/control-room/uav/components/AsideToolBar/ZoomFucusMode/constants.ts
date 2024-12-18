/** 镜头变焦模式 */
export enum Mode {
  /** 手动 */
  MF = 0,
  /** 单点 */
  AFS = 1,
  /** 自动 */
  AFC = 2,
}

export const modeMap = new Map<Mode, string>([
  [Mode.MF, 'MF'],
  [Mode.AFS, 'AFS'],
  [Mode.AFC, 'AFC'],
])

export const modeZhMap = new Map<Mode, string>([
  [Mode.MF, '手动'],
  [Mode.AFS, '单点'],
  [Mode.AFC, '自动'],
])
