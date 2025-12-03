import { Switch } from 'antd'
import ScheduleModal from './ScheduleModal'
import {
  deleteActionPlan,
  startActionPlan,
  stopActionPlan,
  terminateActionPlan,
  updateActionPlan,
} from '@/service/modules/action-plan'
import { useAppMsg } from '@/hooks/useAppMsg'
import IconMore from '@/assets/icons/jsx/IconMore'
import IconButtonWithDropDown from '@/components/ui/button/IconButtonWithDropDown'
import { Link, useSearchParams } from 'react-router-dom'
import IconButton from '@/components/ui/button/IconButton'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import { dateOnly } from '@/constant/time-fmt'
import CustomExpandIcon from '@/components/CustomExpandIcon'
import TagItemV2 from '@/components/ui/TagItemV2'
import {
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'
import OverflowText from '@/components/ui/OverflowText'
import globalConfig from '@/global/config'

type PropsType = {
  data: API_ACTION_PLAN.domain.Plan
}

export const StatusList = ['PENDING', 'PROCESSING', 'TERMINATE'] as const

const StatusType = {
  PENDING: 'default',
  PROCESSING: 'success',
  TERMINATE: 'error',
}

const weekOfDayMap = new Map<string, string>([
  ['0', 'sunday'],
  ['1', 'monday'],
  ['2', 'tuesday'],
  ['3', 'wednesday'],
  ['4', 'thursday'],
  ['5', 'friday'],
  ['6', 'saturday'],
])

const ScheduleListItem: FC<PropsType> = memo(({ data }) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()
  const msgApi = useAppMsg()

  const actionPlanId = useParams().actionPlanId

  const handleConfirm = async (e: API_ACTION_PLAN.domain.Plan) => {
    try {
      setLoading(true)
      await updateActionPlan({
        ...e,
        id: data.id,
      })
      setOpen(false)
      queryClient.invalidateQueries({
        queryKey: ['getActionPlanList'],
      })
      msgApi.success(t('api.success.msg'))
    } finally {
      setLoading(false)
    }
  }

  const handleTerminate = async () => {
    await terminateActionPlan(data.id!)
    queryClient.invalidateQueries({
      queryKey: ['getActionPlanList'],
    })
    msgApi.success(t('api.success.msg'))
  }

  const handleChangeValid = async () => {
    const checked = data.isValid === 'YES'
    if (checked) {
      await stopActionPlan(data.id!)
    } else {
      if (globalConfig.env === 'sh-jh' && data.isPass !== 1) {
        msgApi.error('行动未报备审批通过，无法开启计划')
        return
      }
      await startActionPlan(data.id!)
    }
    queryClient.invalidateQueries({
      queryKey: ['getActionPlanList'],
    })
    msgApi.success(t('api.success.msg'))
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    // 防止默认行为 (Link 的跳转)
    e.preventDefault()
    await deleteActionPlan(data.id!)
    await queryClient.invalidateQueries({
      queryKey: ['getActionPlanList'],
    })
  }

  const frequencyFmt = useMemo(() => {
    if (data.cycleType === 'DAILY') {
      return `${t('common.every')} ${data.intervalValue} ${t('common.day')}`
    }
    if (data.cycleType === 'WEEKLY') {
      return `${t('common.every')} ${data.intervalValue} ${t(
        'common.week',
      )} (${data.dayOfWeek
        ?.split(',')
        .map((day) => t(`dayOfWeek.${weekOfDayMap.get(day)}`))
        .join(', ')})`
    }
    if (data.cycleType === 'MONTHLY') {
      return `${t('common.every')} ${data.intervalValue} ${t(
        'common.month',
      )} (${data.dayOfMonth?.split(',').join(', ')})`
    }
  }, [data, t])

  const [expand, { toggle: toggleExpand }] = useBoolean(false)
  const [searchParams] = useSearchParams()
  const isShJhEnv = globalConfig.env === 'sh-jh'

  return (
    <li
      className={clsx(
        'card-border text-sm p-2 bg-ground-1 hover:border-primary cursor-pointer text-fore',
        actionPlanId == data.id && 'border-primary',
      )}
    >
      <Link
        to={{
          pathname: `/schedule/${data.id!}`,
          search: searchParams.toString(),
        }}
        replace
        className="hover:text-fore"
      >
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TagItemV2
                type={StatusType[data.status as (typeof StatusList)[number]]}
              >
                {t(`schedule.status.${data.status}.title`)}
              </TagItemV2>
              <OverflowText className="text-hightlight flex-1 max-w-40 truncate text-sm">
                {data.name}
              </OverflowText>
            </div>
            <div className="flex items-center gap-2">
              {data.status !== 'TERMINATE' ? (
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  <IconButtonWithDropDown
                    menu={{
                      items: [
                        {
                          key: 'edit',
                          label: t('common.edit'),
                          onClick: () => setOpen(true),
                        },
                        {
                          key: 'terminate',
                          label: t('common.terminate'),
                          onClick: handleTerminate,
                        },
                      ],
                    }}
                    trigger={['click']}
                  >
                    <IconMore />
                  </IconButtonWithDropDown>
                  <Switch
                    size="small"
                    className=" scale-[85%]"
                    checked={data.isValid === 'YES'}
                    onChange={handleChangeValid}
                  />
                </div>
              ) : (
                <IconAsyncButton
                  tippyProps={{ content: t('common.delete') }}
                  onClick={handleDelete}
                >
                  <IconDelete />
                </IconAsyncButton>
              )}
              <IconButton
                className="ml-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  toggleExpand()
                }}
              >
                <CustomExpandIcon isActive={expand} />
              </IconButton>
            </div>
          </div>
          <div className="mt-1 text-xs flex justify-between">
            <div className="w-2/3 flex gap-2 items-center">
              <span>
                {t('common.creator')}: {data.gmtCreateBy}
              </span>
            </div>

            <p className="w-1/3">
              {t('common.type')}: {t(`schedule.type.${data.type}.title`)}
            </p>
          </div>
          <div className="mt-1 text-xs flex">
            <p className="w-2/3">
              <span>
                {t('common.device')}: {data.actionConfig?.deviceNames || '-'}
              </span>
            </p>
            <p className="w-1/3">
              <span>
                断点续飞:{' '}
                {data.breakPointEnable === 'YES' ? (
                  <CheckCircleOutlined className="text-green-500" />
                ) : (
                  <CloseCircleOutlined />
                )}
              </span>
            </p>
          </div>
          <div className="mt-1 text-xs flex">
            <p className="w-full truncate max-w-72">
              {t('schedule.form.taskType.title')}:{' '}
              {t(`schedule.taskType.${data.taskType ?? 'NORMAL'}.title`)}
            </p>
          </div>
          <div className="mt-1 text-xs flex">
            <p className="w-full truncate max-w-72">
              {t('wayline.title')}: {data.actionConfig?.templateName}
            </p>
          </div>
          {isShJhEnv && (
            <div className="mt-1 text-xs flex gap-1 items-center">
              <span>报备状态:</span>
              {data.isPass === 1 ? (
                <div className="text-green-500 flex gap-1 items-center">
                  <CheckOutlined />
                  已报备
                </div>
              ) : data.isPass === 2 ? (
                <div className="text-orange-500 flex gap-1 items-center">
                  <ClockCircleOutlined />
                  待审批
                </div>
              ) : (
                <div className="text-red-500 flex gap-1 items-center">
                  <CloseOutlined />
                  未报备
                </div>
              )}
            </div>
          )}
          {expand && (
            <>
              <div className="mt-1 text-xs">
                {t('common.date')}: {dayjs(data.startTime).format(dateOnly)} -{' '}
                {dayjs(data.endTime).format(dateOnly)}
              </div>
              <div className="mt-1 text-xs">
                {t('common.frequency')}: {frequencyFmt}
              </div>
              <div className="mt-1 text-xs">
                {t('common.time')}:{' '}
                {data.executeTime?.map((e) => e).join(', ') || '-'}
              </div>
            </>
          )}
        </div>
      </Link>
      {open && (
        <ScheduleModal
          title={t('schedule.edit.title')}
          open={open}
          data={data}
          loading={loading}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </li>
  )
})

ScheduleListItem.displayName = 'ScheduleListItem'

export default ScheduleListItem
