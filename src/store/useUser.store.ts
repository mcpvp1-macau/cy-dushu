import {
  getSystemInfo,
  getSystemRoleMenu,
  getUserByToken,
} from '@/service/modules/user'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { getAllDeviceType, getDeviceTree } from '@/service/modules/device'

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

interface DeviceItem {
  label: string
  value: string
  type: 'DeviceItem'
  children: GroupDeviceTree[]
  relatedGroup: string[]
}

interface GroupAndDeviceType {
  label: string
  value: string
  type: 'DeviceType' | 'Group'
  children: GroupDeviceTree[]
}
/** 组织设备树 */
export type GroupDeviceTree = GroupAndDeviceType | DeviceItem

type StateType = {
  token: string | null
  user: User | null
  menus: Menu[] | null
  menuMap: Record<string, Menu> | null
  systemInfo:
    | (API_USER.res.GetSystemInfoRes & { config: Record<string, any> })
    | null
  /** 组织设备树 */
  groupDeviceTree: GroupDeviceTree[]
  vendorBackUrl: string | null
}

type ActionsType = {
  logout: () => void
  fetchUserInfoAndMenus: () => void
  fetchSystemInfo: () => void
  /**通过设备类型请求并更新组织设备树，拥有缓存 */
  fetchGroupDeviceTreeByType: (type: string) => Promise<boolean>
  /** 初始化组织设备树 */
  initGroupDeviceTree: () => void
  /** 初始化第三方返回地址 */
  initVendorBackurl: () => void
}

/** 预加载的设备类型 */
// const prepareDeviceType = ['UAV', 'UAV_AIRPORT']
const prepareDeviceType = []

/** 用户与组织信息 */
const useUserStore = create<StateType & ActionsType>()(
  devtools(
    (set, get) => ({
      token: null,
      user: null,
      menus: null,
      menuMap: null,
      systemInfo: null,
      groupDeviceTree: [],
      /** 第三方返回地址 */
      vendorBackUrl: null,
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
        // 缓存username
        await localStorage.setItem('username', resp1.data.username || '')

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
          globalConfig.merge(config)
        } catch (error) {
          set(
            { systemInfo: { ...resp.data, config: {} } },
            false,
            'fetchSystemInfo',
          )
        }
      },
      fetchGroupDeviceTreeByType: async (type: string) => {
        const groupDeviceTree = [...get().groupDeviceTree]
        const itemIndex = groupDeviceTree.findIndex((e) => e.value === type)!
        // 如果已经存在，则不重复请求
        if (groupDeviceTree[itemIndex]?.children?.length) return false
        // 如果不存在，则请求
        const res = await getDeviceTree({ type })

        // 处理devices数据
        const handleDevice = (
          data: API_DEVICE.domain.Device[],
          relatedGroup: string[],
        ) => {
          return data.map((e) => {
            return {
              label: e.deviceName || e.name,
              value: e.deviceId,
              type: 'DeviceItem',
              children: [],
              relatedGroup,
              isLeaf: true,
            }
          })
        }
        // 处理children数据，children中嵌套包含children和devices
        const handleGroup = (
          data: API_DEVICE.domain.DeviceTreeItem[],
          relatedGroup: string[],
        ) => {
          return data.map((e) => {
            const newRelatedGroup = Array.from(
              new Set([...relatedGroup, e.groupId]),
            )

            const devices = handleDevice(e.devices, newRelatedGroup)
            const children = handleGroup(e.children, newRelatedGroup)
            // 不同的设备都会有相同的组织，所以组织前加上设备类型前缀
            return {
              label: e.groupName,
              value: `${type}-${e.groupId}`,
              type: 'Group',
              children: [...devices, ...children],
            }
          })
        }

        groupDeviceTree[itemIndex].children = handleGroup([res.data], [])

        set({ groupDeviceTree }, false, 'updateGroupDeviceTree')

        return true
      },
      initGroupDeviceTree: async () => {
        const res = await getAllDeviceType()
        const data: GroupDeviceTree[] = []
        res.data.rows.forEach((e) => {
          data.push({
            label: e.name,
            value: e.type,
            type: 'DeviceType',
            children: [],
          })
        })
        set({ groupDeviceTree: data }, false, 'initGroupDeviceTree')

        prepareDeviceType.forEach((deviceType) => {
          get().fetchGroupDeviceTreeByType(deviceType)
        })
      },
      initVendorBackurl: () => {
        const param = new URLSearchParams(location.search)
        const rawUrl = param.get('backurl')
        const vendorBackUrl = rawUrl ? decodeURIComponent(rawUrl) : null
        set({ vendorBackUrl })
      },
    }),
    {
      name: 'user',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useUserStore
