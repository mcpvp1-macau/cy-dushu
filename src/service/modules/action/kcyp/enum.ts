/** 处理过程状态 */
export enum ProcessStatusEnum {
  INIT = 'INIT',
  PROCESSING = 'PROCESSING',
  TIMEOUT = 'TIMEOUT',
  COMPLETE = 'COMPLETE',
  RESP_ERROR = 'RESP_ERROR',
}

export enum ZhoushanProcessResultEnum {
  /** 未推送过警情 */
  NOT_PUSHED = 0,
  /** 仅推送了警情, 未推送照片和视频 */
  PUSHED_CASE_ONLY = 1,
  /** 推送了警情和照片, 未推送视频 */
  PUSHED_CASE_AND_PHOTO = 2,
  /** 推送了警情、照片和视频 */
  PUSHED_ALL = 3,
}
