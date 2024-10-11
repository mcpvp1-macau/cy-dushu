import MenuIconAction from '@/assets/icons/jsx/menus/MenuIconAction'
import EditableNameHeader from '@/components/EditableNameHeader'
import { getAction, updAction } from '@/service/modules/action'
import { GetProps, Tabs } from 'antd'
import SourceTypeSelect from '../../components/SourceTypeSelect'
import { Outlet, useMatch } from 'react-router'
import AppViewSuspense from '@/components/AppViewSuspense'
import { Provider } from './context'

type PropsType = unknown

const PageSituationActionDetail: FC<PropsType> = memo(() => {
  const { actionId } = useParams()

  const queryClient = useQueryClient()

  const matchedAction = useMatch('/action/:actionId')

  const { data, isLoading } = useQuery(
    {
      queryKey: ['action', actionId],
      queryFn: () => getAction({ actionId }),
      select: (data) => data.data,
    },
    queryClient,
  )

  const params = useParams()
  const [sourceType, setSourceType] = useState(params.sourceType ?? '')
  const navigate = useNavigate()

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
        <p>
          <MenuIconAction /> 行动中
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

  const handleTabChange = (key: string) => {
    if (key === 'action') {
      navigate('')
    } else {
      navigate(`source/${sourceType}`)
    }
  }

  const [changeLoading, setChangeLoading] = useState(false)
  const handleNameChangeFinish = async (name: string) => {
    setChangeLoading(true)
    try {
      await updAction({ id: actionId, name })
      await queryClient.invalidateQueries({
        queryKey: ['action', actionId],
      })
    } finally {
      setChangeLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-y-hidden">
      <EditableNameHeader
        loading={isLoading || changeLoading}
        value={data?.name}
        className="px-3"
        onBackClick={() => navigate('/', { replace: true })}
        onFinish={handleNameChangeFinish}
      />
      <Tabs
        className="px-3 mt-2"
        items={menus}
        size="small"
        onChange={handleTabChange}
        defaultActiveKey={matchedAction ? 'action' : 'source'}
      />
      <div className="flex-1 overflow-y-hidden">
        <Provider value={data}>
          <AppViewSuspense>
            <Outlet />
          </AppViewSuspense>
        </Provider>
      </div>
    </div>
  )
})

PageSituationActionDetail.displayName = 'PageSituationActionDetail'

export default PageSituationActionDetail
