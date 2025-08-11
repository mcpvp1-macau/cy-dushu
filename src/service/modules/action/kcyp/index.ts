import serverJingqi from '@/service/servers/serverJingqi'
import serverUavXiaoshan from '@/service/servers/serverUavXiaoshan'

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

/** 获取萧山大华卡口图片 */
export const getSipCascadePicture = (
  data: API_KCYP.req.GetSipCascadePictureReq,
) => {
  return serverUavXiaoshan.post(
    '/sip-cascade/xiaoshan/dahua/picture/query',
    data,
  )
}
