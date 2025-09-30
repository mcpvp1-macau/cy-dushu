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
import ActionEventDetail from './components/ActionEventDetail'
import ActionMediaPicture from './components/ActionMediaPicture'
import IconButton from '@/components/ui/button/IconButton'
import IconMap from '@/assets/icons/jsx/IconMap'
import ZSKCYPModal from './components/kcyp/zhoushan/Modal'
import ZSBIWUModal from './components/zhoushan_biwu/Modal'
import { ActionEnum } from '@/constant/action/action_type'

const ChildActions = lazy(
  () => import('./components/ChildActions/ChildActions'),
)
const ActionLogList = lazy(() => import('./components/ActionLogList'))
const AIResult = lazy(() => import('./components/AIResult'))

type PropsType = {
  detail?: API_ACTION.domain.ActionDetail
  /**
   * 是否是回溯
   */
  isBacktracking?: boolean
}

const PageActionDetailSub: FC<PropsType> = memo(
  ({ detail, isBacktracking = false }) => {
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
    const d = useActionDetail()
    const actionDetail = detail || d

    const { t } = useTranslation()

    const [enablePictureOnMap, setEnablePictureOnMap] = useState(false)

    const items = useMemo(() => {
      if (!actionDetail?.type) {
        return []
      }

      const items: {
        label: string
        key: string
        children: JSX.Element
      }[] = []

      if (actionDetail.eventId) {
        items.push({
          label: t('common.event'),
          key: 'event',
          children: <ActionEventDetail eventId={actionDetail.eventId} />,
        })
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
        extra: !isBacktracking && <AddTask actionId={actionId!} />,
        children: (
          <AppViewSuspense>
            <ChildActions
              actionId={actionId!}
              isBacktracking={isBacktracking}
            />
          </AppViewSuspense>
        ),
      }

      const pictures = {
        label: t('common.pictureData'),
        key: 'picture',
        extra: (
          <div onClick={(e) => e.stopPropagation()}>
            <IconButton
              active={enablePictureOnMap}
              onClick={() => setEnablePictureOnMap(!enablePictureOnMap)}
            >
              <IconMap />
            </IconButton>
          </div>
        ),
        children: (
          <ActionMediaPicture
            actionId={actionId!}
            enablePictureOnMap={enablePictureOnMap}
          />
        ),
      }

      const aiResult = {
        label: t('action.detail.ai_result.title'),
        key: '3',
        extra: [
          'kcyp_action',
          'xiaoshan_kcyp_action',
          'zs_kcyp_action',
          'biwu_action',
        ].includes(actionDetail.type)
          ? !isBacktracking &&
            (actionDetail.type === 'zs_kcyp_action' ? (
              <ZSKCYPModal
                actionId={actionId!}
                actionType={actionDetail.type}
                detail={actionDetail}
              />
            ) : actionDetail.type === 'biwu_action' ? (
              <ZSBIWUModal
                actionId={actionId!}
                actionType={actionDetail.type}
                detail={actionDetail}
              />
            ) : (
              <KCYPModal
                actionId={actionId!}
                actionType={actionDetail.type}
                detail={actionDetail}
              />
            ))
          : null,
        children: (
          <AppViewSuspense>
            <AIResult
              actionId={actionId!}
              isBacktracking={isBacktracking}
              detail={actionDetail}
            />
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
      if (actionDetail.type === ActionEnum.KCYP) {
        return items.concat([kcyp, task, pictures, aiResult, log])
      }
      if (actionDetail.type === ActionEnum.KCYPXS) {
        return items.concat([kcyp, task, pictures, aiResult, log])
      }
      if (actionDetail.type === ActionEnum.KCYPZS) {
        return items.concat([kcyp, task, pictures, aiResult, log])
      }
      return items.concat([task, pictures, aiResult, log])
    }, [actionDetail?.type, enablePictureOnMap])

    return (
      <div className="pt-3 h-full flex flex-col overflow-y-hidden">
        {actionDetail ? (
          <ScrollArea className="grow">
            <AppCollapse defaultActiveKey={['2', '3', '4']} items={items} />
          </ScrollArea>
        ) : (
          <AppSpin />
        )}
        {!isBacktracking && (
          <div className="text-center p-3">
            <Button
              type="primary"
              className="w-28"
              onClick={handleEndActionClick}
            >
              {t('action.detail.end.title')}
            </Button>
          </div>
        )}
      </div>
    )
  },
)

PageActionDetailSub.displayName = 'PageActionDetailSub'

export default PageActionDetailSub
