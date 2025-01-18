import { Link } from 'react-router-dom'
import MenuIconAction from '@/assets/icons/jsx/menus/MenuIconAction'
import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import MenuIconOrganization from '@/assets/icons/jsx/menus/MenuIconOrganization'
import MenuIconSituation from '@/assets/icons/jsx/menus/MenuIconSituation'
import MenuIconSource from '@/assets/icons/jsx/menus/MenuIconSource'
import MenuIconSchedule from '@/assets/icons/jsx/menus/MenuIconSchedule'
import useUserStore from '@/store/useUser.store'
import MenuIconEvents from '@/assets/icons/jsx/menus/MenuIconEvents'
import MenuIconDefence from '@/assets/icons/jsx/menus/MenuIconDefence'

type PropsType = unknown

const menus = [
  {
    key: 'situation',
    path: '/',
    auth: '',
    component: <MenuIconSituation className="text-lg text-[#529DCE]" />,
  },
  {
    path: '/events',
    auth: 'event',
    component: <MenuIconEvents className="text-lg text-[#B86C6C]" />,
  },
  {
    path: '/action-record',
    auth: 'action',
    component: <MenuIconAction className="text-lg text-[rgb(78,154,160)]" />,
  },
  {
    path: '/sources',
    auth: 'device',
    component: <MenuIconSource className="text-lg text-[#63588F]" />,
  },
  {
    path: '/organization',
    auth: 'organization',
    component: <MenuIconOrganization className="text-lg text-[#3D8882]" />,
    color: '#3D8882',
  },
  {
    path: '/airline',
    auth: 'airline',
    component: <MenuIconAirline className="text-lg text-[#4F81D7]" />,
  },
  {
    path: '/schedule',
    auth: 'actionPlan',
    component: <MenuIconSchedule className="text-lg text-[#B86C6C]" />,
  },
  {
    path: '/defence',
    auth: 'defence',
    component: <MenuIconDefence className="text-lg text-[#4F81D7]" />,
  },
]

const AppNavigator: FC<PropsType> = memo(() => {
  const userMenus = useUserStore((s) => s.menus)
  const renderMenus = useMemo(() => {
    const set = new Set((userMenus ?? []).map((e) => e.url))
    set.add('')
    return menus.filter((e) => set.has(e.auth))
  }, [userMenus])

  return (
    <nav className="h-full w-[38px] bg-ground-100 z-20 shadow-[0_2px_4px_#00000080]">
      <ul className="flex flex-col items-center py-3 gap-3">
        {renderMenus.map((e) => (
          <li key={e.path}>
            <Link
              to={e.path}
              className={clsx(
                'w-[28px] h-[28px] bg-ground-200 border border-solid border-ground-300 rounded',
                'flex justify-center items-center',
                'hover:border-fore transition-all duration-500',
              )}
            >
              {e.component}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
})

AppNavigator.displayName = 'AppNavigator'

export default AppNavigator
