import MenuIconSchedule from '@/assets/icons/jsx/menus/MenuIconSchedule'
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

type PropsType = {
  data: API_ACTION_PLAN.domain.Plan
}

const StatusColorMap = {
  PENDING: '#C7D1DC',
  PROCESSING: '#15B371',
  TERMINATE: '#DD4444',
}

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
        <div>
          <MenuIconSchedule />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="text-white">{data.name}</span>
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
          <div className="mt-1 text-xs flex gap-2 justify-between">
            <TagItem
              label={t(`schedule.status.${data.status}.title`)}
              color={StatusColorMap[data.status!]}
              bgColor={`${StatusColorMap[data.status!]}33`}
            />
            <span className="flex-1">
              {t('common.creator')}: {data.gmtCreateBy}
            </span>
            <span className="flex-1">
              {t('common.type')}: {t(`schedule.type.${data.type}.title`)}
            </span>
          </div>
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
