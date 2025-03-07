import serverJingqi from '@/service/servers/serverJingqi'

/**
 * 对话列表接口
 *
 * https://jingan.yuque.com/staff-ycgiyb/ctubtf/zfyxy99pg2zc60x1#OHyn2
 */
export const getDialogList = (data: API_TANQI.req.GetDialogList) => {
  return serverJingqi.post<API_TANQI.res.GetDialogList>('/dialog/list', data)
}

/**
 * 开始对话接口
 *
 * https://jingan.yuque.com/staff-ycgiyb/ctubtf/zfyxy99pg2zc60x1#qNBzb
 * @returns 会话ID
 */
export const startNewDialog = (data: API_TANQI.req.NewDialogConfig) => {
  return serverJingqi.post<number>('/dialog/start', data)
}

/**
 * 更新对话
 *
 * https://jingan.yuque.com/staff-ycgiyb/ctubtf/zfyxy99pg2zc60x1#k64rW
 * @param data
 * @returns
 */
export const updateDialog = (data: API_TANQI.req.UpdateDialog) => {
  return serverJingqi.post('/dialog/update', data)
}

/**
 * 删除会话
 *
 * https://jingan.yuque.com/staff-ycgiyb/ctubtf/zfyxy99pg2zc60x1#Fdr03
 * @param data
 * @returns
 */
export const deleteDialog = (data: { id: number }) => {
  return serverJingqi.post('/dialog/delete', data)
}

/**
 * 获取会话详情
 *
 * https://jingan.yuque.com/staff-ycgiyb/ctubtf/zfyxy99pg2zc60x1#H7NZq
 * @param data
 * @returns
 */
export const getDialogDetail = (data: {
  id: number
  page: number
  size: number
}) => {
  return serverJingqi.post('/dialog/details', data)
}

/**
 * 发送对话接口
 *
 * https://jingan.yuque.com/staff-ycgiyb/ctubtf/zfyxy99pg2zc60x1#u0dRv
 * @param data
 * @returns
 */
export const sendDialogMsg = (data: API_TANQI.req.SendDialogMsg) => {
  return serverJingqi.post('/dialog/send', data)
}

/**
 * 停止对话接口
 *
 * https://jingan.yuque.com/staff-ycgiyb/ctubtf/zfyxy99pg2zc60x1#mK8dw
 * @param data
 */
export const stopDialogReq = (data: { id: number }) => {
  return serverJingqi.post('/dialog/stop', data)
}
