import {
  shouldShowError,
  unAuthorized,
  withInternational,
  withToken,
} from './interceptors'
import LiqunAxios from './liqunAxios'
import createSign from '@/utils/ak'

const serverAK = new LiqunAxios<'common'>({
  baseURL: '/proxy4aApi/TTPService',
  timeout: 20_000,
})

serverAK.interceptors.request.use(withToken)
serverAK.interceptors.request.use(withInternational)
serverAK.interceptors.request.use((config) => {
  
  const { AccessKeyId, Signature } = createSign({
    ...(config.params || {}),
    ...(config.data || {}),
  })
  config.params = {
    ...(config.params || {}),
    AccessKeyId,
    Signature,
  }
  return config
})

serverAK.interceptors.response.use(unAuthorized, unAuthorized)

serverAK.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(resp.data)
  }
  return resp.data
})

export default serverAK
