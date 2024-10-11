import { getSystemRoleMenu, getUserByToken } from '@/service/modules/user'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface User {
  userId: number
  username: string
  name: string
  phone: any
  idCard: any
  groupId: string
  remark: any
  createAt: string
  updateAt: string
  disable: any
  userRoles: {
    id: number
    roleId: number
  }
  expiredTime: string
}

export interface Menu {
  menuId: number
  menuParentId: any
  systemId: number
  menuName: string
  url: string
  menuType: string
  tag: any
  icon: any
}

type StateType = {
  token: string | null
  user: User | null
  menus: Menu[] | null
}

type ActionsType = {
  logout: () => void
  fetchUserInfoAndMenus: () => void
}

/** 用户信息 */
const useUserStore = create<StateType & ActionsType>()(
  devtools(
    (set, get) => ({
      token: null,
      user: null,
      menus: null,
      // 登出
      logout: async () => {
        set({ token: null, user: null, menus: null }, false, 'logout')
        await local.removeItem('token')
        const { loginUrl, systemName } = globalConfig
        location.href = `${loginUrl}?systemName=${systemName}&fallback=${
          location.origin + location.pathname
        }`
      },
      fetchUserInfoAndMenus: async () => {
        const { token } = get()
        const [resp1, resp2] = await Promise.all([
          getUserByToken(token!),
          getSystemRoleMenu({}),
        ])
        set(
          { user: resp1.data, menus: resp2.data.rows },
          false,
          'fetchUserInfoAndMenus',
        )
      },
    }),
    {
      name: 'user',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useUserStore
