import MenuIconAction from '@/assets/icons/jsx/menus/MenuIconAction'
import AppViewSuspense from '@/components/AppViewSuspense'
import CollapsedPage from '@/components/CollapsedPage'
import { GetProps, Tabs } from 'antd'
import { Outlet, useMatch } from 'react-router'
import SourceTypeSelect from './components/SourceTypeSelect'
import MenuIconEvents from '@/assets/icons/jsx/menus/MenuIconEvents'
import useUserStore from '@/store/useUser.store'

type PropsType = unknown

const PageSituation: FC<PropsType> = memo(() => {
  const mathchedSource = useMatch('/source/:sourceType')
  const matchEvents = useMatch('situation/events')

  const activeKey = mathchedSource
    ? 'source'
    : matchEvents
    ? 'events'
    : 'action'

  const navigate = useNavigate()
  const menuMap = useUserStore((s) => s.menuMap)

  const params = useParams()
  const [sourceType, setSourceType] = useState(params.sourceType ?? '')

  const handleSourceTypeChange = useMemoizedFn((type: string) => {
    setSourceType(type)
    if (type && activeKey === 'source') {
      // 确定是 sourceType 变化，才跳转
      navigate(`source/${type}`, { replace: true })
    }
  })

  const { t } = useTranslation()
  const menus: GetProps<typeof Tabs>['items'] = [
    {
      key: 'action',
      label: (
        <p className="flex gap-2">
          <MenuIconAction />
          {t('situation.menus.action')}
        </p>
      ),
    },
    {
      key: 'source',
      label: (
        <div onClick={(e) => e.preventDefault()}>
          <SourceTypeSelect
            value={sourceType}
            onChange={handleSourceTypeChange}
          />
        </div>
      ),
    },
    {
      key: 'events',
      label: (
        <p className="flex gap-2">
          <MenuIconEvents />
          {t('situation.menus.events')}
        </p>
      ),
    },
  ]

  const handleTabChange = useMemoizedFn((key: string) => {
    if (key === 'action') {
      navigate('action')
    } else if (key === 'events') {
      navigate('situation/events')
    } else if (key === 'source' && sourceType) {
      navigate(`source/${sourceType}`)
    }
  })

  const newMenus = useMemo(() => {
    const isShowAction = menuMap?.['action']
    // const isShowSource = menuMap?.['device']
    const isShowEvents = menuMap?.['event']

    return menus.filter((e) => {
      if (e.key === 'action') {
        return isShowAction
      } else if (e.key === 'source') {
        return true
      } else if (e.key === 'events') {
        return isShowEvents
      }
    })
  }, [menuMap, menus])

  // 如果 action 菜单被隐藏，则跳转到 source 菜单
  useEffect(() => {
    const isShowAction = menuMap?.['action']
    if (!isShowAction && activeKey === 'action') {
      navigate(`source/${sourceType || 'UAV'}`)
    }
  }, [menuMap, activeKey, sourceType, navigate])

  return (
    <CollapsedPage>
      <div className="h-full flex flex-col overflow-hidden">
        {!params.actionId && (
          <Tabs
            className="px-3 mt-2"
            items={newMenus}
            size="small"
            activeKey={activeKey}
            onChange={handleTabChange}
          />
        )}
        <AppViewSuspense>
          <Outlet />
        </AppViewSuspense>
      </div>
    </CollapsedPage>
  )
})

PageSituation.displayName = 'PageSituation'

export default PageSituation
