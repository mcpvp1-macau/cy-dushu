import server4A from '@/service/servers/server4A'

export const getUserByToken = async (
  token: string,
  options?: Record<string, any>,
) => {
  return server4A.post('/login/getUserByToken', { token }, options)
}

export async function logout(token: string, options?: Record<string, any>) {
  return server4A.post('/login/logout', { token }, options)
}

export async function getUserList(data?: Record<string, any>) {
  return server4A.post('/user/userList', data)
}

export async function getGroupTree(groupId: string) {
  return server4A.post<API_USER.res.GetGroupTreeRes>('/group/groupTree', {
    groupId,
  })
}

/**获取当前系统角色的功能 POST /systemRoleMenuList */
export const getSystemRoleMenu = (params: any) => {
  return server4A.post('/roleMenu/systemRoleMenuList', params)
}

export const getSystemInfo = (systemName: string) => {
  return server4A.post('/system/getSystemByName', { systemName })
}
