import MenuIconAction from '@/assets/icons/jsx/menus/MenuIconAction'
import AppViewSuspense from '@/components/AppViewSuspense'
import CollapsedPage from '@/components/CollapsedPage'
import { GetProps, Tabs } from 'antd'
import { Outlet, useMatch } from 'react-router'
import SourceTypeSelect from './components/SourceTypeSelect'
import MenuIconEvents from '@/assets/icons/jsx/menus/MenuIconEvents'

type PropsType = unknown

const PageSituation: FC<PropsType> = memo(() => {
  const mathchedSource = useMatch('/source/:sourceType')
  const matchEvents = useMatch('situation/events')

  const navigate = useNavigate()

  const params = useParams()
  const [sourceType, setSourceType] = useState(params.sourceType ?? '')

  const handleSourceTypeChange = useMemoizedFn((type: string) => {
    setSourceType(type)
    if (sourceType && type) {
      // 确定是 sourceType 变化，才跳转
      navigate(`source/${type}`)
    }
  })

  const menus: GetProps<typeof Tabs>['items'] = [
    {
      key: 'action',
      label: (
        <p className="flex gap-2">
          <MenuIconAction />
          行动
        </p>
      ),
    },
    {
      key: 'source',
      label: (
        <SourceTypeSelect
          value={sourceType}
          onChange={handleSourceTypeChange}
        />
      ),
    },
    {
      key: 'events',
      label: (
        <p className="flex gap-2">
          <MenuIconEvents />
          事件
        </p>
      ),
    },
  ]

  const handleTabChange = useMemoizedFn((key: string) => {
    if (key === 'action') {
      navigate('action')
    } else if (key === 'events') {
      navigate('situation/events')
    } else {
      navigate(`source/${sourceType}`)
    }
  })

  return (
    <CollapsedPage>
      <div className="h-full flex flex-col overflow-hidden">
        {!params.actionId && (
          <Tabs
            className="px-3 mt-2"
            items={menus}
            size="small"
            onChange={handleTabChange}
            defaultActiveKey={
              mathchedSource ? 'source' : matchEvents ? 'events' : 'action'
            }
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
