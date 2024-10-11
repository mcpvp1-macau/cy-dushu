import serverJingqi from '@/service/servers/serverJingqi'

export const getDictList = (data = {}) => {
  return serverJingqi.post<API_DICT.res.DictListRes>('/dict/list', data)
}
