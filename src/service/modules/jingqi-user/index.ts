import serverJingqi from '@/service/servers/serverJingqi'

export const getUserList = (data) => {
  return serverJingqi.post('/bind/user/list', data)
}
