import { shouldShowError } from './interceptors'
import LiqunAxios from './liqunAxios'

const serverDitingMCP = new LiqunAxios<'ditingTanqi'>({
  baseURL: `/ditingMCPServer`,
  timeout: 60_000,
})

serverDitingMCP.interceptors.response.use((resp) => {
  if (!resp.data?.success) {
    shouldShowError(resp)
    return Promise.reject(resp.data)
  }
  return resp.data
})

export default serverDitingMCP
