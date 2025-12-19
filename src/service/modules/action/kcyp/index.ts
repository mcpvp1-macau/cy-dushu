import serverJingqi from '@/service/servers/serverJingqi'
import serverUavXiaoshan from '@/service/servers/serverUavXiaoshan'
import serverVideo from '@/service/servers/serverVideo'

/** 查询工单暂存记录 */
export const getKCYPOrder = (data: API_KCYP.req.GetKCYPOrderReq) => {
  return serverJingqi.post<API_KCYP.res.GetKCYPOrderRes>('/kcyp/get', data)
}

/** 保存工单暂存记录 */
export const saveKCYPOrder = (data: API_KCYP.req.SaveKYCPOrderReq) => {
  return serverJingqi.post('/kcyp/save', data)
}

/** 最终工单提交 */
export const commitKYCPOrder = (data: {
  kcypActionCommit: any
  pictures: any
}) => {
  return serverJingqi.post<API_KCYP.res.CommitKCYPRes>('/kcyp/commit', data)
}

export const checkCarNo = (
  data: { carNo: string; carType: string; carColor }[],
) => {
  return serverJingqi.post<API_KCYP.res.CheckNoRes>('/kcyp/checkCarNo', {
    carNos: data,
  })
}

/** 查询萧山工单暂存记录 */
export const getXSKCYPOrder = (data: API_KCYP.req.GetKCYPOrderReq) => {
  return serverJingqi.post<API_KCYP.res.GetKCYPOrderRes>(
    '/xiaoshan/kcyp/get',
    data,
  )
}

/** 保存萧山工单 */
export const saveXSKCYPOrder = (data: any) => {
  return serverJingqi.post('/xiaoshan/kcyp/save', data)
}

/** 最终工单提交 */
export const commitXiaoshanKCYP = (data: any) => {
  return serverJingqi.post('/xiaoshan/kcyp/commit', data)
}

/** 萧山车牌检测 */
export const checkLicensePlate = (
  data: Pick<
    API_ACTION.domain.AIResultRecord,
    |
      'actionId'
      | 'actionItemId'
      | 'actionItemRecordId'
      | 'actionRecordId'
      | 'plateNo'
      | 'plateColor'
      | 'plateType'
  >,
) => {
  return serverJingqi.post('/xiaoshan/kcyp/checkLicensePlate', data)
}

/** 获取萧山大华卡口图片 */
export const getSipCascadePicture = (
  data: API_KCYP.req.GetSipCascadePictureReq,
) => {
  return serverUavXiaoshan.post(
    '/sip-cascade/xiaoshan/dahua/picture/query',
    data,
  )
}

// 舟山快处易赔相关 ---------------------------------------------------------
/** 获取警情状态信息 */
export const getZSKCYPOrder = (data: { caseId: string }) => {
  return serverJingqi.post(
    '/zhouShan/quickPaymentEasy/getPoliceInformationPushStatus',
    data,
  )
}

/** 暂存工单 */
export const saveZSKCYPOrder = (data: API_KCYP.domain.ZSOrderRecord) => {
  return serverJingqi.post('/zhouShan/quickPaymentEasy/temporaryStorage', data)
}

/** 警情推送 */
export const commitZSKCYPInfoOrder = (data: API_KCYP.domain.ZSOrderRecord) => {
  return serverJingqi.post(
    '/zhouShan/quickPaymentEasy/policeInformationPush',
    data,
  )
}

/** 警情图片推送 */
export const commitZSKCYPPictures = (data: {
  caseId: string
  policeNumber: string
  pictures: { pictureUrl: string; imageType: string }[]
}) => {
  return serverJingqi.post(
    '/zhouShan/quickPaymentEasy/policeInformationPicturesPush',
    data,
  )
}

/** 获取视频播放地址 */
export const getZSKCYPVideoURL = (data: {
  deviceId: string
  begin: number
  end: number
}) => {
  return serverVideo.post<{ url: string; fileId: string; size: number }>(
    '/stream/vod/hls2mp4',
    data,
  )
}

/** 警情视频推送 */
export const commitZSKCYPVideo = (data: {
  caseId: string
  policeNumber: string
  deviceId: string
  begin: number
  end: number
}) => {
  return serverJingqi.post(
    '/zhouShan/quickPaymentEasy/policeInformationVideoPush',
    data,
  )
}
