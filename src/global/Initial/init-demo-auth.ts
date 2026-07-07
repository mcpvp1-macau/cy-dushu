import useUserStore, { Menu, User } from '@/store/useUser.store'

/** 演示模式假用户 */
const DEMO_USER: User = {
  userId: 1,
  username: 'demo',
  name: '演示用户',
  groupName: '演示单位',
  phone: null,
  idCard: null,
  groupId: 'demo-group',
  remark: null,
  createAt: '',
  updateAt: '',
  disable: false,
  userRoles: { id: 1, roleId: 1 },
  expiredTime: '',
}

/** 演示模式菜单权限 (放开全部一级菜单) */
const DEMO_MENU_URLS = [
  '',
  'event',
  'action',
  'device',
  'organization',
  'airline',
  'actionPlan',
  'defence',
  'alarm',
  'documents',
]

const DEMO_MENUS: Menu[] = DEMO_MENU_URLS.map((url, index) => ({
  menuId: index + 1,
  menuParentId: null,
  systemId: 1,
  menuName: url || 'situation',
  url,
  menuType: 'menu',
  tag: null,
  icon: null,
}))

/**
 * 演示模式初始化: 跳过登录鉴权, 注入本地假用户与菜单
 */
const initDemoAuth = () => {
  const menuMap: Record<string, Menu> = {}
  DEMO_MENUS.forEach((e) => {
    menuMap[e.url] = e
  })

  useUserStore.setState({
    token: 'demo-token',
    user: DEMO_USER,
    menus: DEMO_MENUS,
    menuMap,
    logoLoading: false,
  })

  localStorage.setItem('username', DEMO_USER.username)
}

export default initDemoAuth
