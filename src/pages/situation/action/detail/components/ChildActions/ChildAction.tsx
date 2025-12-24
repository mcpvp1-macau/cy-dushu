import IconDetail from '@/assets/icons/jsx/IconDetail'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconButton from '@/components/ui/button/IconButton'
import OverflowText from '@/components/ui/OverflowText'
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
import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import { isNil } from 'lodash'
import IconRelayWayline from '@/assets/icons/jsx/IconRelayWayline'
import globalConfig from '@/global/config'
import IconNotReported from '@/assets/icons/jsx/IconNotReported'

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
  PENDING: 'rgb(var(--fore-color))',
  PROCESSING: '#4C90F0',
  FINISHED: '#22c55e',
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
        queryKey: ['action', data.actionId, 'items'],
      })
      msgApi.success(t('api.success.msg'))
      if (action === 'end') {
        queryClient.invalidateQueries({
          queryKey: ['action', 'item', 'device', 'latest'],
          exact: false,
        })
      }
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
          <Button
            size="small"
            disabled={globalConfig.useFlightReporting && data.isPassed !== 1}
            onClick={() => handleClick('start')}
          >
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
    const flightReportingEnabled = globalConfig.useFlightReporting

    const handleRelaySuccess = async () => {
      await queryClient.invalidateQueries({
        queryKey: ['action', String(data.actionId), 'items'],
      })
    }

    // 执行人员
    const pilotInfos = useMemo(() => {
      const pilots = shouldJson(data.extra)
      if (Array.isArray(pilots)) {
        return pilots
      }
      return []
    }, [data.extra])

    const pilotsStr = useMemo(() => {
      if (data.pilotName) {
        return data.pilotName
      }
      return pilotInfos.map((p) => p.name).join(', ')
    }, [data.pilotName, pilotInfos])

    const orgStr = useMemo(() => {
      if (data.orgName) {
        return data.orgName
      }
      return pilotInfos
        .map((p) => p.orgName)
        .filter(Boolean)
        .join(', ')
    }, [data.orgName, pilotInfos])

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
        <div className="flex items-center justify-between mb-1">
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
          {flightReportingEnabled && (
            <div className="flex gap-2 overflow-hidden">
              <div className="basis-3/5 min-w-0">
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="text-nowrap">
                    {t('action.detail.task.people.title')}:
                  </span>
                  <OverflowText className="min-w-0 flex-1 truncate">
                    {pilotsStr || '-'}
                  </OverflowText>
                </div>
              </div>
              <div className="basis-2/5 min-w-0">
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="text-nowrap">组织:</span>
                  <OverflowText className="min-w-0 flex-1 truncate">
                    {orgStr || '-'}
                  </OverflowText>
                </div>
              </div>
            </div>
          )}
          {flightReportingEnabled && (
            <div className="flex gap-2 overflow-hidden">
              <div className="basis-3/5 min-w-0">
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="text-nowrap">飞行高度:</span>
                  <OverflowText className="min-w-0 flex-1 truncate">
                    {data.flightHeight ?? '-'} m
                  </OverflowText>
                </div>
              </div>
              <div className="basis-2/5 min-w-0">
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="text-nowrap">返航高度:</span>
                  <OverflowText className="min-w-0 flex-1 truncate">
                    {data.returnHeight ?? '-'} m
                  </OverflowText>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2 overflow-hidden">
            <div
              className={`min-w-0 ${
                flightReportingEnabled ? 'basis-3/5' : 'basis-full'
              }`}
            >
              <div className="flex items-center gap-1 overflow-hidden">
                <span className="text-nowrap">
                  {t('action.detail.task.status.title')}:
                </span>
                <OverflowText className="min-w-0 flex-1 truncate">
                  <span style={{ color: statusColor[data.status!] }}>
                    {taskStatusMap[i18n.language][data.status!]}
                  </span>
                </OverflowText>
              </div>
            </div>
            {flightReportingEnabled && (
              <div className="basis-2/5 min-w-0">
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="text-nowrap">报备状态:</span>
                  {data.isPassed === 1 ? (
                    <div className="text-green-500 flex items-center gap-1 min-w-0">
                      <CheckOutlined />
                      <OverflowText className="min-w-0 flex-1 truncate">
                        已报备
                      </OverflowText>
                    </div>
                  ) : data.isPassed === 2 ? (
                    <div className="text-orange-500 flex items-center gap-1 min-w-0">
                      <ClockCircleOutlined />
                      <OverflowText className="min-w-0 flex-1 truncate">
                        报备中
                      </OverflowText>
                    </div>
                  ) : data.isPassed === 0 ? (
                    <div className="text-red-500 flex items-center gap-1 min-w-0">
                      <CloseOutlined />
                      <OverflowText className="min-w-0 flex-1 truncate">
                        报备失败
                      </OverflowText>
                    </div>
                  ) : (
                    <div className="text-fore flex items-center gap-1 min-w-0">
                      <IconNotReported />
                      <OverflowText className="min-w-0 flex-1 truncate">
                        未报备
                      </OverflowText>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 overflow-hidden">
            <div className="basis-full min-w-0">
              <div className="flex items-center gap-1 overflow-hidden">
                <span className="text-nowrap">
                  {t('action.detail.task.device.title')}:
                </span>
                {data.deviceId && (
                  <IconButton
                    tippyProps={{ content: t('common.detail') }}
                    onClick={handleDetailClick}
                  >
                    <IconDetail />
                  </IconButton>
                )}
                <OverflowText className="min-w-0 flex-1 truncate">
                  {data.deviceName || '-'}
                </OverflowText>
              </div>
            </div>
          </div>
          {(data.taskTplId || breakPointId) && (
            <div className="flex gap-2 overflow-hidden">
              {data.taskTplId && (
                <div
                  className={`${
                    breakPointId ? 'basis-3/5' : 'basis-full'
                  } min-w-0`}
                >
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-nowrap">{t('wayline.title')}:</span>
                    <OverflowText className="min-w-0 flex-1 truncate">
                      {waylineNameMap?.[data.templateId] || '-'}
                    </OverflowText>
                  </div>
                </div>
              )}
              {breakPointId && (
                <div
                  className={`${
                    data.taskTplId ? 'basis-2/5' : 'basis-full'
                  } min-w-0 flex justify-start`}
                >
                  <IconButton
                    tippyProps={{ content: '接力飞行' }}
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
                </div>
              )}
            </div>
          )}
        </div>
      </>
    )
  },
)

ChildAction.displayName = 'ChildAction'

export default ChildAction
