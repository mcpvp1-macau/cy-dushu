import IconDetail from '@/assets/icons/jsx/IconDetail'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconButton from '@/components/ui/button/IconButton'
import RelayDeviceModal from '@/components/device/RelayDeviceModal'
import { WaylineEnum } from '@/constant/uav/wayline'
import { RightModeEnum } from '@/enum/right-mode'
import useStartActionItem from '@/hooks/service/action/useStartActionItem'
import { useAppMsg } from '@/hooks/useAppMsg'
import {
  getWaylineEditURL,
  WaylineIcon,
} from '@/pages/wayline/components/AirlineTemplateListItem'
import {
  endActionItem,
  pauseActionItem,
  startActionItem,
} from '@/service/modules/action-item'
import useRightMode from '@/store/layout/useRightMode.store'
import { shouldJson } from '@/utils/json'
import { LoadingOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { isNil } from 'lodash'
import IconRelayWayline from '@/assets/icons/jsx/IconRelayWayline'

type PropsType = {
  data: API_ACTION_ITEM.domain.ActionItem
  noEdit?: boolean
  visible?: boolean
  waylineNameMap?: Record<string, string>
  onVisibleChange?: (visible: boolean) => void
}

export const taskStatusMap: Record<string, Record<string, string>> = {
  en: {
    PENDING: 'Pending',
    PROCESSING: 'Tasking',
    FINISHED: 'Finished',
    PAUSE: 'Pausing',
  },
  zh: {
    PENDING: '未开始',
    PROCESSING: '进行中',
    FINISHED: '已完成',
    PAUSE: '暂停',
  },
}

const statusColor: Record<string, string> = {
  PENDING: '#C7D1DC',
  PROCESSING: '#4C90F0',
  FINISHED: '#15B371',
  PAUSE: '#C7D1DC',
}

/** 操作栏 */
const OperatorBtns: FC<PropsType> = ({ data, noEdit }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { startActionItem: start, stopModalHolder } = useStartActionItem()

  const handleClick = async (action: string) => {
    setLoading(true)
    try {
      await {
        start: () => start(() => startActionItem(data.id)),
        pause: () => pauseActionItem({ actionItemId: data.id, isPause: true }),
        continue: () =>
          pauseActionItem({ actionItemId: data.id, isPause: false }),
        end: () => endActionItem(data.id),
      }[action]()
      await queryClient.invalidateQueries({
        queryKey: ['action', String(data.actionId), 'items'],
      })
      msgApi.success(t('api.success.msg'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingOutlined />
  }
  switch (data.status) {
    case 'PENDING':
      const info = shouldJson(data.taskTemplateInfo)
      let params = `?actionId=${data.actionId}&actionItemId=${data.id}&name=${
        data.actionItemName ?? ''
      }`
      if (info) {
        if (!isNil(info.parameters)) {
          params += `&parameters=${JSON.stringify(info.parameters)}`
        }
        if (!isNil(info.taskBasic)) {
          params += `&taskBasic=${info.taskBasic}`
        }
        if (!isNil(info.camera)) {
          params += `&camera=${JSON.stringify(info.camera)}`
        }
      }
      const type = shouldJson(info?.taskBasic)?.waylineType ?? 'waypoint'

      return (
        <div className="flex gap-2">
          {!noEdit && (
            <Button
              size="small"
              disabled={isNil(data.taskTplId)}
              icon={!isNil(data.taskTplId) && <WaylineIcon type={type} />}
              onClick={() => {
                navigate(
                  `${getWaylineEditURL(type)}/${data.taskTplId}${params}`,
                )
              }}
            >
              {t('action.detail.task.edit.title')}
            </Button>
          )}
          <Button size="small" onClick={() => handleClick('start')}>
            {t('action.detail.task.start.title')}
          </Button>
          {stopModalHolder}
        </div>
      )
    case 'PROCESSING':
      return (
        <div className="flex gap-2">
          <Button size="small" onClick={() => handleClick('pause')}>
            {t('action.detail.task.pause.title')}
          </Button>
          <Button size="small" onClick={() => handleClick('end')}>
            {t('action.detail.task.end.title')}
          </Button>
        </div>
      )
    case 'PAUSE':
      return (
        <div className="flex gap-2">
          <Button size="small" onClick={() => handleClick('continue')}>
            {t('action.detail.task.continue.title')}
          </Button>
          <Button size="small" onClick={() => handleClick('end')}>
            {t('action.detail.task.end.title')}
          </Button>
        </div>
      )
  }
  return null
}

/** 子任务 */
const ChildAction: FC<PropsType> = memo(
  ({ data, visible, noEdit, waylineNameMap, onVisibleChange }) => {
    const { t, i18n } = useTranslation()
    const queryClient = useQueryClient()
    const [relayModalOpen, setRelayModalOpen] = useState(false)
    const breakPointId = data.breakPointId

    const handleRelaySuccess = async () => {
      await queryClient.invalidateQueries({
        queryKey: ['action', String(data.actionId), 'items'],
      })
    }

    // 执行人员
    const pilotsStr = useMemo(() => {
      const pilots = shouldJson(data.extra) || []
      if (Array.isArray(pilots)) {
        return pilots.map((p) => p.name).join(', ')
      }
      return ''
    }, [data.extra])

    const handleDetailClick = () => {
      useRightMode.getState().updateRightMode(RightModeEnum.DEVICE)
      useRightMode.getState().updateDetailId(data.deviceId!)
    }

    const waylineType = useMemo(
      () =>
        shouldJson(shouldJson(data.taskTemplateInfo)?.taskBasic)?.waylineType,
      [data.taskTemplateInfo],
    )

    return (
      <>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex gap-2 items-start">
            <IconButton
              disabled={
                !data.taskTplId ||
                waylineType === WaylineEnum.PointCloud3DWayline
              }
              onClick={() => onVisibleChange?.(!visible)}
            >
              {visible ? <IconVisible /> : <IconNotVisible />}
            </IconButton>
            <span className="text-hightlight">
              {data.actionItemName || '-'}
            </span>
          </div>
          <OperatorBtns data={data} noEdit={noEdit} />
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <div>
            <span className="mr-1">
              {t('action.detail.task.people.title')}:
            </span>
            <span>{pilotsStr || '-'}</span>
          </div>
          <div className="flex gap-2 overflow-hidden">
            <div className="grow flex overflow-hidden">
              <span className="mr-1 text-nowrap">
                {t('action.detail.task.device.title')}:
              </span>
              <div className="flex items-center gap-1 overflow-hidden">
                {data.deviceId && (
                  <IconButton
                    toolTipProps={{ title: t('common.detail') }}
                    onClick={handleDetailClick}
                  >
                    <IconDetail />
                  </IconButton>
                )}
                <p className="flex-1 truncate">{data.deviceName || '-'}</p>
              </div>
            </div>
            <p className="shrink-0">
              <span className="mr-1 text-nowrap">
                {t('action.detail.task.status.title')}:
              </span>
              <span style={{ color: statusColor[data.status!] }}>
                {taskStatusMap[i18n.language][data.status!]}
              </span>
            </p>
          </div>
          <div className="flex">
            {data.taskTplId && (
              <div>
                <p>
                  <span className="mr-1 text-nowrap">
                    {t('wayline.title')}:{' '}
                    {waylineNameMap?.[data.templateId] || '-'}
                  </span>
                </p>
              </div>
            )}
            {breakPointId && (
              <>
                <IconButton
                  toolTipProps={{ title: '接力飞行' }}
                  onClick={() => {
                    setRelayModalOpen(true)
                  }}
                >
                  <IconRelayWayline />
                </IconButton>
                <RelayDeviceModal
                  open={relayModalOpen}
                  breakPointId={breakPointId}
                  deviceName={data.deviceName}
                  relayDeviceId={data.relayDeviceId}
                  onSuccess={handleRelaySuccess}
                  onClose={() => setRelayModalOpen(false)}
                />
              </>
            )}
          </div>
        </div>
      </>
    )
  },
)

ChildAction.displayName = 'ChildAction'

export default ChildAction
