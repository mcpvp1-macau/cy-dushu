import {
  shouldShowError,
  unAuthorized,
  withInternational,
} from './interceptors'
import LiqunAxios from './liqunAxios'

const serverShare = new LiqunAxios<'common'>({
  baseURL: '/proxy4aApi/TTPService',
  timeout: 20_000,
})

serverShare.interceptors.request.use(withInternational)

serverShare.interceptors.response.use(unAuthorized, unAuthorized)

serverShare.interceptors.response.use((resp) => {
  if (resp.data?.code !== 'SUCCESS') {
    shouldShowError(resp)
    return Promise.reject(resp.data)
  }
  return resp.data
})

export default serverShare
