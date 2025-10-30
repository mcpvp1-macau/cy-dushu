import { withToken } from './interceptors'
import LiqunAxios from './liqunAxios'

const serverFlight3D = new LiqunAxios<'axios'>({
  baseURL: `/proxyApi/otherService/${globalConfig.systemName}/flight3d`,
  timeout: 60_000 * 10,
})

serverFlight3D.interceptors.request.use(withToken)

export default serverFlight3D
