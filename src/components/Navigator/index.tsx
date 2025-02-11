import { Link, useMatches } from 'react-router-dom'
import MenuIconAction from '@/assets/icons/jsx/menus/MenuIconAction'
import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import MenuIconOrganization from '@/assets/icons/jsx/menus/MenuIconOrganization'
import MenuIconSituation from '@/assets/icons/jsx/menus/MenuIconSituation'
import MenuIconSource from '@/assets/icons/jsx/menus/MenuIconSource'
import MenuIconSchedule from '@/assets/icons/jsx/menus/MenuIconSchedule'
import useUserStore from '@/store/useUser.store'
import MenuIconEvents from '@/assets/icons/jsx/menus/MenuIconEvents'
import MenuIconDefence from '@/assets/icons/jsx/menus/MenuIconDefence'
import { twMerge } from 'tailwind-merge'

type PropsType = unknown

const menus = [
  {
    id: 'situation',
    key: 'situation',
    path: '/',
    auth: '',
    component: <MenuIconSituation className="text-lg text-[#529DCE]" />,
  },
  {
    id: 'events',
    path: '/events',
    auth: 'event',
    component: <MenuIconEvents className="text-lg text-[#B86C6C]" />,
  },
  {
    id: 'action-record',
    path: '/action-record',
    auth: 'action',
    component: <MenuIconAction className="text-lg text-[rgb(78,154,160)]" />,
  },
  {
    id: 'sources',
    path: '/sources',
    auth: 'device',
    component: <MenuIconSource className="text-lg text-[#63588F]" />,
  },
  {
    id: 'organization',
    path: '/organization',
    auth: 'organization',
    component: <MenuIconOrganization className="text-lg text-[#3D8882]" />,
    color: '#3D8882',
  },
  {
    id: 'airline',
    path: '/airline',
    auth: 'airline',
    component: <MenuIconAirline className="text-lg text-[#4F81D7]" />,
  },
  {
    id: 'schedule',
    path: '/schedule',
    auth: 'actionPlan',
    component: <MenuIconSchedule className="text-lg text-[#B86C6C]" />,
  },
  {
    id: 'defence',
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

  const matches = useMatches()
  const usedKey = useMemo(() => new Set(matches.map((m) => m.id)), [matches])

  return (
    <nav className="h-full w-[38px] bg-ground-1 z-20 shadow-[0_2px_4px_#00000080]">
      <ul className="flex flex-col items-center py-3 gap-3">
        {renderMenus.map((e) => (
          <li key={e.id}>
            <Link
              to={e.path}
              className={twMerge(
                clsx(
                  'w-[28px] h-[28px] bg-ground-3 border border-solid border-ground-5 rounded',
                  'flex justify-center items-center',
                  'hover:border-fore transition-all duration-500',
                  {
                    'border-fore': usedKey.has(e.id ?? ''),
                  },
                ),
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
