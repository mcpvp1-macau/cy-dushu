import TagItem from '@/components/TagItem'
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
import { Link } from 'react-router-dom'
import IconButton from '@/components/ui/button/IconButton'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import { dateOnly } from '@/constant/time-fmt'
import CustomExpandIcon from '@/components/CustomExpandIcon'

type PropsType = {
  data: API_ACTION_PLAN.domain.Plan
}

const StatusColorMap = {
  PENDING: '#C7D1DC',
  PROCESSING: '#15B371',
  TERMINATE: '#DD4444',
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
      await startActionPlan(data.id!)
    }
    queryClient.invalidateQueries({
      queryKey: ['getActionPlanList'],
    })
    msgApi.success(t('api.success.msg'))
  }

  const handleDelete = async () => {
    await deleteActionPlan(data.id!)
    queryClient.invalidateQueries({
      queryKey: ['getActionPlanList'],
    })
    msgApi.success(t('api.success.msg'))
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

  return (
    <li className="my-1">
      <Link
        className={clsx(
          'flex px-3 p-2 gap-2  cursor-pointer text-sm',
          'hover:bg-[#242E37] hover:text-fore',
          actionPlanId == data.id && 'bg-[#242E37] text-fore',
        )}
        to={`/schedule/${data.id!}`}
        replace
      >
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* <MenuIconSchedule /> */}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  toggleExpand()
                }}
              >
                <CustomExpandIcon isActive={expand} />
              </IconButton>
              <span className="text-white">{data.name}</span>
            </div>
            {data.status !== 'TERMINATE' ? (
              <div
                className="flex items-center gap-3"
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
                  className=" scale-90"
                  checked={data.isValid === 'YES'}
                  onChange={handleChangeValid}
                />
              </div>
            ) : (
              <IconButton
                toolTipProps={{ title: t('common.delete') }}
                onClick={handleDelete}
              >
                <IconDelete />
              </IconButton>
            )}
          </div>
          <div className="mt-1 text-xs flex justify-between">
            <div className="w-2/3 flex gap-2 items-center">
              <TagItem
                label={t(`schedule.status.${data.status}.title`)}
                color={StatusColorMap[data.status!]}
                bgColor={`${StatusColorMap[data.status!]}33`}
              />
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
              <span>断点续飞: -</span>
            </p>
          </div>
          <div className="mt-1 text-xs">
            {t('wayline.title')}: {data.actionConfig?.templateName}
          </div>
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
