import ActionStopButton from './components/ActionStopButton'
import AppViewSuspense from '@/components/AppViewSuspense'
import AppCollapse from '@/components/AppCollapse'
import AddTask from './components/AddTask'
import AddSHJHTask from './components/AddSHJHTask'
import useActionDetail from './context'
import AppSpin from '@/components/AppSpin'
import AppEmpty from '@/components/AppEmpty'
import { ScrollArea } from '@/components/ui/scroll-area'
import KCYPPanel from './components/kcyp/Panel'
import { Suspense, lazy } from 'react'
import ActionEventDetail from './components/ActionEventDetail'
import ActionMediaPicture from './components/ActionMediaPicture'
import IconButton from '@/components/ui/button/IconButton'
import IconMap from '@/assets/icons/jsx/IconMap'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'

import { ActionEnum } from '@/constant/action/action_type'
import AddEventResolveTask from './components/AddEventResolveTask'
import { useQueryClient } from '@tanstack/react-query'

import { LoadingOutlined, PictureOutlined } from '@ant-design/icons'

const ChildActions = lazy(
  () => import('./components/ChildActions/ChildActions'),
)
const ActionLogList = lazy(() => import('./components/ActionLogList'))
const AIResult = lazy(() => import('./components/AIResult'))
const KCYPModal = lazy(() => import('./components/kcyp/KCYPModal'))

const actionDetailPanelDefaultActiveKeys = ['2', '3', '4']

type PropsType = {
  detail?: API_ACTION.domain.ActionDetail
  /**
   * 是否是回溯
   */
  isBacktracking?: boolean
}

const PageActionDetailSub: FC<PropsType> = memo(
  ({ detail, isBacktracking = false }) => {
    const { actionId: actionIdParam } = useParams()
    const actionId = Number(actionIdParam)

    const d = useActionDetail()
    const actionDetail = detail || d

    const { t } = useTranslation()

    const queryClient = useQueryClient()

    const [enablePictureOnMap, setEnablePictureOnMap] = useState(false)
    const [activeKeys, setActiveKeys] = useState<string[]>(
      actionDetailPanelDefaultActiveKeys,
    )

    useEffect(() => {
      setActiveKeys(actionDetailPanelDefaultActiveKeys)
      setEnablePictureOnMap(false)
    }, [actionId])

    const TaskComponent = globalConfig.useFlightReporting
      ? AddSHJHTask
      : AddTask

    const items = useMemo(() => {
      if (!actionDetail?.type) {
        return []
      }

      const items: {
        label: string
        key: string
        children: JSX.Element
        extra?: JSX.Element | false
      }[] = []

      const kcyp = {
        label: t('action.detail.kcyp.title'),
        key: '1',
        children: (
          <KCYPPanel actionId={actionId} actionType={actionDetail.type} />
        ),
      }
      const task = {
        label: t('action.detail.task.title'),
        key: '2',
        extra: !isBacktracking && (
          <div className="flex gap-2">
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                if (!Number.isFinite(actionId)) return
                queryClient.invalidateQueries({
                  queryKey: ['action', actionId, 'items'],
                })
              }}
            >
              <IconRefresh />
            </IconButton>
            {actionDetail.eventId && (
              <AddEventResolveTask
                actionId={actionId}
                eventId={actionDetail.eventId}
              />
            )}
            <TaskComponent actionId={actionId} actionType={actionDetail.type} />
          </div>
        ),
        children: (
          <AppViewSuspense>
            <ChildActions
              actionId={actionId}
              isBacktracking={isBacktracking}
              actionType={actionDetail?.type}
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
            <IconButton
              tippyProps={{ content: t('common.pictureData') }}
              onClick={() =>
                setActiveKeys((keys) =>
                  keys.includes('picture') ? keys : [...keys, 'picture'],
                )
              }
            >
              <PictureOutlined />
            </IconButton>
          </div>
        ),
        children: (
          <ActionMediaPicture
            actionId={actionId}
            enablePictureOnMap={enablePictureOnMap}
          />
        ),
      }

      const eventList = {
        label: '事件列表',
        key: 'event',
        children: actionDetail.eventId ? (
          <ActionEventDetail eventId={actionDetail.eventId} />
        ) : (
          <AppEmpty />
        ),
      }

      const aiResult = {
        label: t('action.detail.ai_result.title'),
        key: '3',
        extra: (
          <Suspense fallback={<LoadingOutlined />}>
            <KCYPModal
              actionId={actionId}
              actionType={actionDetail.type}
              detail={actionDetail}
              isBacktracking={isBacktracking}
            />
          </Suspense>
        ),
        children: (
          <AppViewSuspense>
            <AIResult
              actionId={actionId}
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
            <ActionLogList actionId={actionId} />
          </AppViewSuspense>
        ),
      }
      if (actionDetail.type === ActionEnum.KCYP) {
        return items.concat([kcyp, task, pictures, eventList, aiResult, log])
      }
      if (actionDetail.type === ActionEnum.KCYPXS) {
        return items.concat([kcyp, task, pictures, eventList, aiResult, log])
      }
      if (actionDetail.type === ActionEnum.KCYPZS) {
        return items.concat([kcyp, task, pictures, eventList, aiResult, log])
      }
      return items.concat([task, pictures, eventList, aiResult, log])
    }, [
      actionDetail?.eventId,
      actionDetail?.type,
      actionId,
      enablePictureOnMap,
      isBacktracking,
      queryClient,
      t,
    ])

    const handleCollapseChange = (keys: string | string[]) => {
      setActiveKeys((Array.isArray(keys) ? keys : [keys]).map(String))
    }

    return (
      <div className="pt-3 h-full flex flex-col overflow-y-hidden">
        {actionDetail ? (
          <ScrollArea className="grow">
            <AppCollapse
              activeKey={activeKeys}
              items={items}
              onChange={handleCollapseChange}
            />
          </ScrollArea>
        ) : (
          <AppSpin />
        )}
        {!isBacktracking && (
          <div className="text-center p-3">
            <ActionStopButton actionId={actionId} />
          </div>
        )}
      </div>
    )
  },
)

PageActionDetailSub.displayName = 'PageActionDetailSub'

export default PageActionDetailSub
