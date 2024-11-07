import serverAlgorithm from '@/service/servers/serverAlgorithm'
import serverDushu from '@/service/servers/serverDushu'

/** 获取算法列表 */
export const getAlgorithmList = async (
  data: API_Alogrithm.req.GetAlgorithmlistReq,
) => {
  return serverDushu.post<API_Alogrithm.res.GetAlgorithmlistRes>(
    '/algorithm/app/list',
    data,
  )
}

/** 停止算法 */
export const releaseAlgorithm = async (
  data: API_Alogrithm.req.ReleaseAlgorithmReq,
) => {
  return serverAlgorithm.post('/pipeline/release/jingqi', {
    ...data,
    method: 'unDeployPipeline',
  })
}

/** 部署算法 */
export const deployAlgorithm = async (
  data: API_Alogrithm.req.DeployAlgorithmReq,
) => {
  return serverAlgorithm.post('/pipeline/deploy/jingqi', {
    ...data,
    method: 'deploypipeline',
  })
}

/** 更新算法配置 */
export const updateAlogorithmAppConfig = async (data: {
  algorithmAppId: number
  deviceId: string
  algorithmConfig: string
}) => {
  return serverAlgorithm.post('/pipeline/config/update', data)
}
