import MenuIconAction from '@/assets/icons/jsx/menus/MenuIconAction'
import AppViewSuspense from '@/components/AppViewSuspense'
import CollapsedPage from '@/components/CollapsedPage'
import { GetProps, Tabs } from 'antd'
import { Outlet, useMatch } from 'react-router'
import SourceTypeSelect from './components/SourceTypeSelect'

type PropsType = unknown

const PageSituation: FC<PropsType> = memo(() => {
  const mathchedSource = useMatch('/source/:sourceType')

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
  ]

  const handleTabChange = useMemoizedFn((key: string) => {
    if (key === 'action') {
      navigate('action')
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
            defaultActiveKey={mathchedSource ? 'source' : 'action'}
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
