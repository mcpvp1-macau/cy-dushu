import {
  getSystemInfo,
  getSystemRoleMenu,
  getUserByToken,
} from '@/service/modules/user'
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
  menuMap: Record<string, Menu> | null
  systemInfo:
    | (API_USER.res.GetSystemInfoRes & { config: Record<string, any> })
    | null
}

type ActionsType = {
  logout: () => void
  fetchUserInfoAndMenus: () => void
  fetchSystemInfo: () => void
}

/** 用户信息 */
const useUserStore = create<StateType & ActionsType>()(
  devtools(
    (set, get) => ({
      token: null,
      user: null,
      menus: null,
      menuMap: null,
      systemInfo: null,
      // 登出
      logout: async () => {
        set({ token: null, user: null, menus: null }, false, 'logout')
        await local.removeItem('token')
        const { loginUrl, systemName } = globalConfig
        location.href = `${loginUrl}?systemName=${systemName}&fallback=${encodeURIComponent(
          location.origin + location.pathname + location.search,
        )}`
      },
      fetchUserInfoAndMenus: async () => {
        const { token } = get()
        const [resp1, resp2] = await Promise.all([
          getUserByToken(token!),
          getSystemRoleMenu({}),
        ])
        const m = {}
        resp2.data.rows.forEach((e) => {
          m[e.url] = e
        })
        set(
          { user: resp1.data, menus: resp2.data.rows, menuMap: m },
          false,
          'fetchUserInfoAndMenus',
        )
      },
      fetchSystemInfo: async () => {
        const resp = await getSystemInfo(globalConfig.systemName)
        const data = resp.data
        try {
          const config = JSON.parse(data.config || '{}')
          set(
            { systemInfo: { ...resp.data, config } },
            false,
            'fetchSystemInfo',
          )
        } catch (error) {
          set(
            { systemInfo: { ...resp.data, config: {} } },
            false,
            'fetchSystemInfo',
          )
        }
      },
    }),
    {
      name: 'user',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useUserStore
