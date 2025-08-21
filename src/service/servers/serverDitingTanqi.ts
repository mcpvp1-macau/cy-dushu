import { shouldShowError, withInternational } from './interceptors'
import LiqunAxios from './liqunAxios'

export const baseURL = '/ditingTanqiServer'

const serverDitingTanqi = new LiqunAxios<'ditingTanqi'>({
  baseURL: `${baseURL}/tanqi-diting`,
  timeout: 180_000,
})

serverDitingTanqi.interceptors.request.use((config) => {
  config.headers['tq-authorization'] = 'sk-CUV0SoZsDKYG9LQmQPtQQXSQFnpa60JL'
  return config
})
serverDitingTanqi.interceptors.request.use(withInternational)

// serverDitingTanqi.interceptors.response.use(unAuthorized, unAuthorized)

serverDitingTanqi.interceptors.response.use((resp) => {
  if (!resp.data?.success) {
    shouldShowError(resp)
    return Promise.reject(resp.data)
  }
  return resp.data
})

export default serverDitingTanqi
