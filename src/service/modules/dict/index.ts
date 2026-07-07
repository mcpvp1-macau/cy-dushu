import { DEMO_DICTS } from '@/demo/situation/constants'
import serverControlCenter from '@/service/servers/serverControlCenter'
import serverJingqi from '@/service/servers/serverJingqi'

export const getDictList = (data = {}) => {
  if (globalConfig.demoMode) {
    return Promise.resolve({
      code: 'SUCCESS',
      message: 'demo',
      data: DEMO_DICTS,
    })
  }
  return serverJingqi.post<API_DICT.res.DictListRes>('/dict/list', data)
}

export const getControlCenterDictList = () => {
  return serverControlCenter.post<API_DICT.res.ControlCenterDictList>(
    '/v3/dji/dict/list',
  )
}
