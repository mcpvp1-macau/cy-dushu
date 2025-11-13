import MenuIconAction from '@/assets/icons/jsx/menus/MenuIconAction'
import EditableNameHeader from '@/components/EditableNameHeader'
import { getAction, updAction } from '@/service/modules/action'
import { GetProps, Tabs } from 'antd'
import SourceTypeSelect from '../../components/SourceTypeSelect'
import { Outlet } from 'react-router'
import AppViewSuspense from '@/components/AppViewSuspense'
import { Provider } from './context'
import ActionTypeCheckout from './components/ActionTypeCheckout'
import AppSpin from '@/components/AppSpin'
import Reconstruction2DResolver from './components/ActionRecon2DResolver'
import ActionTanqi from './components/ActionTanqi/ActionTanqi'
import { useSearchParams } from 'react-router-dom'

type PropsType = unknown

const PageSituationActionDetail: FC<PropsType> = memo(() => {
  const { actionId } = useParams()
  const location = useLocation()
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const defaultActiveTab = /^\/action\/[^/]+\/source.*/.test(location.pathname)
    ? 'source'
    : 'action'

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
  const [searchParams, setSearchParams] = useSearchParams()

  const handleSourceTypeChange = useMemoizedFn((type: string) => {
    setSourceType(type)
    if (defaultActiveTab === 'source' && sourceType && type) {
      // 确定是 sourceType 变化，才跳转
      navigate(`source/${type}`)
      setSearchParams(searchParams)
    }
  })

  const menus: GetProps<typeof Tabs>['items'] = [
    {
      key: 'action',
      label: (
        <p>
          <MenuIconAction /> {t('action.status.PROCESSING')}
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
      setSearchParams(searchParams)
    } else {
      navigate(`source/${sourceType}`)
      setSearchParams(searchParams)
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

  if (!data) {
    return <AppSpin />
  }

  return (
    <>
      <div className="h-full flex flex-col overflow-y-hidden">
        <EditableNameHeader
          loading={isLoading || changeLoading}
          value={data?.name ?? ''}
          className="px-3"
          right={<ActionTypeCheckout data={data} />}
          onBackClick={() => navigate('/', { replace: true })}
          onFinish={handleNameChangeFinish}
        />
        <Tabs
          className="px-3 mt-2"
          items={menus}
          size="small"
          onChange={handleTabChange}
          activeKey={defaultActiveTab}
        />
        <div className="flex-1 overflow-y-hidden">
          <Provider value={data}>
            <AppViewSuspense>
              <Outlet />
            </AppViewSuspense>
          </Provider>
        </div>
        {data.type === 'ewjt_action' && (
          <Reconstruction2DResolver actionId={data.id} />
        )}
      </div>
      <ActionTanqi />
    </>
  )
})

PageSituationActionDetail.displayName = 'PageSituationActionDetail'

export default PageSituationActionDetail
