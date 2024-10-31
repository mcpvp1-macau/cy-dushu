import MenuIconSchedule from '@/assets/icons/jsx/menus/MenuIconSchedule'
import TagItem from '@/components/TagItem'
import { Switch } from 'antd'
import ScheduleModal from './ScheduleModal'
import {
  startActionPlan,
  stopActionPlan,
  terminateActionPlan,
  updateActionPlan,
} from '@/service/modules/action-plan'
import { useAppMsg } from '@/hooks/useAppMsg'
import IconMore from '@/assets/icons/jsx/IconMore'
import IconButtonWithDropDown from '@/components/IconButtonWithDropDown'
import { Link } from 'react-router-dom'

type PropsType = {
  data: API_ACTION_PLAN.domain.Plan
}

const TypeMap = {
  DIRECT: '立即',
  SINGLE: '单次定时',
  REPEAT: '重复定时 ',
  CONTINUE: '连续定时',
}

const StatusMap = {
  PENDING: '未开始',
  PROCESSING: '周期中',
  TERMINATE: '已结束',
}

const StatusColorMap = {
  PENDING: '#C7D1DC',
  PROCESSING: '#15B371',
  TERMINATE: '#DD4444',
}

const ScheduleListItem: FC<PropsType> = memo(({ data }) => {
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
      msgApi.success('更新成功')
    } finally {
      setLoading(false)
    }
  }

  const handleTerminate = async () => {
    await terminateActionPlan(data.id!)
    queryClient.invalidateQueries({
      queryKey: ['getActionPlanList'],
    })
    msgApi.success('终止成功')
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
    msgApi.success('操作成功')
  }

  return (
    <li>
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
            {data.status !== 'TERMINATE' && (
              <div
                className="flex items-center gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <IconButtonWithDropDown
                  menu={{
                    items: [
                      {
                        key: 'edit',
                        label: '编辑',
                        onClick: () => setOpen(true),
                      },
                      {
                        key: 'terminate',
                        label: '终止',
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
            )}
          </div>
          <div className="mt-1 text-xs flex gap-2 justify-between">
            <TagItem
              label={StatusMap[data.status!]}
              color={StatusColorMap[data.status!]}
              bgColor={`${StatusColorMap[data.status!]}33`}
            />
            <span className="flex-1">创建人: {data.gmtCreateBy}</span>
            <span className="flex-1">类型: {TypeMap[data.type!]}</span>
          </div>
        </div>
      </Link>
      {open && (
        <ScheduleModal
          title="编辑计划"
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
