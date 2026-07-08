import { Link, useMatches } from 'react-router-dom'
import MenuIconAction from '@/assets/icons/jsx/menus/MenuIconAction'
import MenuIconAlarm from '@/assets/icons/jsx/menus/MenuIconAlarm'
import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import MenuIconSituation from '@/assets/icons/jsx/menus/MenuIconSituation'
import MenuIconSource from '@/assets/icons/jsx/menus/MenuIconSource'
import MenuIconSchedule from '@/assets/icons/jsx/menus/MenuIconSchedule'
import useUserStore from '@/store/useUser.store'
import MenuIconEvents from '@/assets/icons/jsx/menus/MenuIconEvents'
import { twMerge } from 'tailwind-merge'
import { ExperimentOutlined, ReadOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useFullFlowDemoStore } from '@/demo/situation/full-flow-demo.store'
import { useTanqiDialogStore } from '@/components/Tanqi/demo/TanqiFloatDialog'
import useRightMode from '@/store/layout/useRightMode.store'

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
    id: 'wayline',
    path: '/wayline',
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
    id: 'alarms',
    path: '/alarms',
    auth: 'alarm',
    component: <MenuIconAlarm className="text-lg text-[#E3A551]" />,
  },
]

const bottomMenus = [
  {
    id: 'documents',
    path: '/documents',
    auth: 'documents',
    component: <ReadOutlined className="text-lg" />,
  },
]

const AppNavigator: FC<PropsType> = memo(() => {
  const userMenus = useUserStore((s) => s.menus)
  const demoMode = useFullFlowDemoStore((s) => s.mode)
  const setDemoMode = useFullFlowDemoStore((s) => s.setMode)
  const resetFullFlow = useFullFlowDemoStore((s) => s.resetFullFlow)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const renderMenus = useMemo(() => {
    const set = new Set((userMenus ?? []).map((e) => e.url))
    set.add('')
    return menus.filter((e) => set.has(e.auth))
  }, [userMenus])

  const renderMenusBottom = useMemo(() => {
    const set = new Set((userMenus ?? []).map((e) => e.url))
    set.add('')
    return bottomMenus.filter((e) => set.has(e.auth))
  }, [userMenus])

  const matches = useMatches()
  const usedKey = useMemo(() => new Set(matches.map((m) => m.id)), [matches])
  const isFullFlowMode = demoMode === 'full-flow'

  const handleDemoModeToggle = () => {
    useTanqiDialogStore.getState().updateOpen(false)
    useRightMode.getState().updateRightOuterMode(null)
    if (isFullFlowMode) {
      setDemoMode('standard')
    } else {
      resetFullFlow()
      setDemoMode('full-flow')
    }
    queryClient.invalidateQueries({ queryKey: ['actionList'], exact: false })
    queryClient.invalidateQueries({ queryKey: ['waylineTemplates'] })
    queryClient.invalidateQueries({ queryKey: ['airlineTemplate'] })
    navigate('/action')
  }

  return (
    <nav className="h-full w-[38px] bg-ground-1 z-20 shadow-[0_2px_4px_#00000080] flex flex-col justify-between">
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
      <ul className="flex flex-col items-center pb-3 gap-3">
        <li>
          <Tooltip
            placement="right"
            title={isFullFlowMode ? '切回原型页面' : '切换演示页面'}
          >
            <button
              type="button"
              className={twMerge(
                clsx(
                  'w-[28px] h-[28px] bg-ground-3 border border-solid border-ground-5 rounded',
                  'flex justify-center items-center text-fore cursor-pointer',
                  'hover:border-fore transition-all duration-500',
                  {
                    'border-primary text-primary': isFullFlowMode,
                  },
                ),
              )}
              onClick={handleDemoModeToggle}
            >
              <ExperimentOutlined className="text-lg" />
            </button>
          </Tooltip>
        </li>
        {renderMenusBottom.map((e) => (
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
        {/* <li>
          <Link
            to="/documents"
            className={twMerge(
              clsx(
                'w-[28px] h-[28px] bg-ground-3 border border-solid border-ground-5 rounded',
                'flex justify-center items-center',
                'hover:border-fore transition-all duration-500',
                {
                  'border-fore': usedKey.has('documents'),
                },
              ),
            )}
          >
            <ReadOutlined />
          </Link>
        </li> */}
      </ul>
    </nav>
  )
})

AppNavigator.displayName = 'AppNavigator'

export default AppNavigator
