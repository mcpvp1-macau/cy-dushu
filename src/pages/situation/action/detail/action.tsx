import { Button } from 'antd'
import { lazy, memo, type FC } from 'react'
import { endAction } from '@/service/modules/action'
import AppViewSuspense from '@/components/AppViewSuspense'
import AppCollapse from '@/components/AppCollapse'
import AddTask from './components/AddTask'
import KCYPNormalModal from './components/kcyp/NormalModal'
import useActionDetail from './context'
import AppSpin from '@/components/AppSpin'
import { ScrollArea } from '@/components/ui/scroll-area'

const ChildActions = lazy(() => import('./components/ChildActions'))
const ActionLogList = lazy(() => import('./components/ActionLogList'))
const AIResult = lazy(() => import('./components/AIResult'))
const KCYPNormalPanel = lazy(() => import('./components/kcyp/NormalPanel'))

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

  return (
    <div className="pt-3 h-full flex flex-col overflow-y-hidden">
      {actionDetail ? (
        <ScrollArea className="grow">
          <AppCollapse
            defaultActiveKey={['2']}
            items={[
              {
                label: '事故信息',
                key: '1',
                children: (
                  <AppViewSuspense>
                    <KCYPNormalPanel actionId={actionId!} />
                  </AppViewSuspense>
                ),
              },
              {
                label: '任务列表',
                key: '2',
                extra: <AddTask actionId={actionId!} />,
                children: (
                  <AppViewSuspense>
                    <ChildActions actionId={actionId!} />
                  </AppViewSuspense>
                ),
              },
              {
                label: '检测结果',
                key: '3',
                extra: <KCYPNormalModal actionId={actionId!} />,
                children: (
                  <AppViewSuspense>
                    <AIResult actionId={actionId!} />
                  </AppViewSuspense>
                ),
              },
              {
                label: '行动记录',
                key: '4',
                children: (
                  <AppViewSuspense>
                    <ActionLogList actionId={actionId!} />
                  </AppViewSuspense>
                ),
              },
            ]}
          />
        </ScrollArea>
      ) : (
        <AppSpin />
      )}
      <div className="text-center p-3">
        <Button type="primary" className="w-28" onClick={handleEndActionClick}>
          结束行动
        </Button>
      </div>
    </div>
  )
})

PageActionDetailSub.displayName = 'PageActionDetailSub'

export default PageActionDetailSub
