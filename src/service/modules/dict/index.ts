import serverControlCenter from '@/service/servers/serverControlCenter'
import serverJingqi from '@/service/servers/serverJingqi'

export const getDictList = (data = {}) => {
  return serverJingqi.post<API_DICT.res.DictListRes>('/dict/list', data)
}

export const getControlCenterDictList = () => {
  return serverControlCenter.post<API_DICT.res.ControlCenterDictList>(
    '/v3/dji/dict/list',
  )
}
