import { Button } from 'antd'
import { endAction } from '@/service/modules/action'
import AppViewSuspense from '@/components/AppViewSuspense'
import AppCollapse from '@/components/AppCollapse'
import AddTask from './components/AddTask'
import KCYPModal from './components/kcyp/Modal'
import useActionDetail from './context'
import AppSpin from '@/components/AppSpin'
import { ScrollArea } from '@/components/ui/scroll-area'
import KCYPPanel from './components/kcyp/Panel'
import { lazy } from 'react'

const ChildActions = lazy(() => import('./components/ChildActions'))
const ActionLogList = lazy(() => import('./components/ActionLogList'))
const AIResult = lazy(() => import('./components/AIResult'))

type PropsType = unknown

const PageActionDetailSub: FC<PropsType> = memo(() => {
  const { actionId } = useParams()

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const handleEndActionClick = useMemoizedFn(async () => {
    await endAction(actionId!)
    await queryClient.invalidateQueries({
      queryKey: ['actionList'],
      exact: false,
      type: 'all',
    })
    navigate('/action', { replace: true })
  })

  const actionDetail = useActionDetail()

  const { t } = useTranslation()

  const items = useMemo(() => {
    if (!actionDetail?.type) {
      return []
    }

    const kcyp = {
      label: t('action.detail.kcyp.title'),
      key: '1',
      children: (
        <KCYPPanel actionId={actionId!} actionType={actionDetail.type} />
      ),
    }
    const task = {
      label: t('action.detail.task.title'),
      key: '2',
      extra: <AddTask actionId={actionId!} />,
      children: (
        <AppViewSuspense>
          <ChildActions actionId={actionId!} />
        </AppViewSuspense>
      ),
    }
    const aiResult = {
      label: t('action.detail.ai_result.title'),
      key: '3',
      extra: ['kcyp_action', 'xiaoshan_kcyp_action'].includes(
        actionDetail.type,
      ) && <KCYPModal actionId={actionId!} actionType={actionDetail.type} />,
      children: (
        <AppViewSuspense>
          <AIResult actionId={actionId!} />
        </AppViewSuspense>
      ),
    }
    const log = {
      label: t('action.detail.log.title'),
      key: '4',
      children: (
        <AppViewSuspense>
          <ActionLogList actionId={actionId!} />
        </AppViewSuspense>
      ),
    }
    if (actionDetail.type === 'kcyp_action') {
      return [kcyp, task, aiResult, log]
    }
    if (actionDetail.type === 'xiaoshan_kcyp_action') {
      return [kcyp, task, aiResult, log]
    }
    return [task, aiResult, log]
  }, [actionDetail?.type])

  return (
    <div className="pt-3 h-full flex flex-col overflow-y-hidden">
      {actionDetail ? (
        <ScrollArea className="grow">
          <AppCollapse defaultActiveKey={['2']} items={items} />
        </ScrollArea>
      ) : (
        <AppSpin />
      )}
      <div className="text-center p-3">
        <Button type="primary" className="w-28" onClick={handleEndActionClick}>
          {t('action.detail.end.title')}
        </Button>
      </div>
    </div>
  )
})

PageActionDetailSub.displayName = 'PageActionDetailSub'

export default PageActionDetailSub
