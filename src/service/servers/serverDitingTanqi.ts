import { formatThrowError, shouldShowError } from './interceptors'
import LiqunAxios from './liqunAxios'

export const baseURL = '/ditingTanqiServer'

const serverDitingTanqi = new LiqunAxios<'ditingTanqi'>({
  baseURL: `${baseURL}/tanqi-diting`,
  timeout: 180_000,
})

serverDitingTanqi.interceptors.response.use((resp) => {
  if (!resp.data?.success) {
    shouldShowError(resp)
    return Promise.reject(formatThrowError(resp)) 
  }
  return resp.data
})

export default serverDitingTanqi
