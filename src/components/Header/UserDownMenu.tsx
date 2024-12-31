import useUserStore from '@/store/useUser.store'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { memo, type FC } from 'react'
import { logout as logout4A } from '@/service/modules/user'

type PropsType = unknown

const UserDownMenu: FC<PropsType> = memo(() => {
  const username = useUserStore((s) => s.user?.name) ?? '-'
  const logout = useUserStore((s) => s.logout)

  const handleLogoutClick = useMemoizedFn(async () => {
    await logout4A(useUserStore.getState().token!)
    logout()
  })

  const { t } = useTranslation()

  return (
    <ul className="border border-solid border-ground-300 rounded text-fore">
      <li className="p-2 flex items-center gap-2">
        <UserOutlined />
        <span>{username}</span>
      </li>
      <div className="bg-ground-300 h-[1px]" />
      <li>
        <button
          className="p-2 flex items-center gap-2"
          onClick={handleLogoutClick}
        >
          <LogoutOutlined />
          {t('login.logout')}
        </button>
      </li>
    </ul>
  )
})

UserDownMenu.displayName = 'UserDownMenu'

export default UserDownMenu
