import { withToken } from './interceptors'
import LiqunAxios from './liqunAxios'

const serverAutoPhotograph = new LiqunAxios<'axios'>({
  baseURL: `/proxyApi/otherService/${globalConfig.systemName}/autoPhotograph`,
  timeout: 60_000,
})

serverAutoPhotograph.interceptors.request.use(withToken)

export default serverAutoPhotograph
