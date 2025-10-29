import AppEmpty from '@/components/AppEmpty'
import Icon from '@/components/Icon'
import { dft } from '@/constant/time-fmt'
import { getActiveTrackPeriods } from '@/service/modules/db-api'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { Tooltip } from 'antd'

type DataTimeRangeProps = {
  deviceId: string
}

export const DataTimeRange = (props: DataTimeRangeProps) => {
  const { deviceId } = props
  const timeRange = useBackTrackingStore((s) => s.timeRange)
  const updateCurrentTime = useBackTrackingStore((s) => s.updateCurrentTime)
  const [sort, setSort] = useState(1)
  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: [
        'getActiveTrackPeriods',
        {
          deviceId,
          startTime: timeRange[0],
          endTime: timeRange[1],
        },
      ],
      queryFn: () =>
        getActiveTrackPeriods({
          deviceId: deviceId!,
          startTime: timeRange[0].format(dft),
          endTime: timeRange[1].format(dft),
        }),
      enabled: !!deviceId,
      select: (data) => data?.data || [],
    },
    queryClient,
  )

  return (
    <div className="mb-2">
      <div className="flex gap-1">
        <div className="w-[60px] flex items-center gap-1 justify-center text-center">
          序号
          <Icon
            id={sort === 1 ? 'icon-caret-down' : 'icon-caret-up'}
            className="text-[10px] cursor-pointer hover:text-primary"
            onClick={() => setSort((prev) => prev * -1)}
          />
        </div>
        <div className="w-[130px]">开始时间</div>
        <div className="w-[130px]">结束时间</div>
      </div>
      {(sort === 1 ? data || [] : (data || []).reverse()).map((item, index) => (
        <div key={item.timeRange} className="flex gap-1">
          <div className="w-[60px] text-center">
            {sort === 1 ? index + 1 : data?.length - index}
          </div>
          {item.timeRange.split('¥').map((time: string) => (
            <>
              <Tooltip
                title={<div className="text-[12px]">时间定位到：{time}</div>}
              >
                <div
                  onClick={() => updateCurrentTime(dayjs(time))}
                  className="w-[130px] flex gap-1 items-center hover:text-primary cursor-pointer"
                >
                  {dayjs(time).format('MM-DD HH:mm:ss')}
                </div>
              </Tooltip>
            </>
          ))}
        </div>
      ))}
      {data?.length === 0 && (
        <AppEmpty description="当前时间段内无采集数据" />
      )}
    </div>
  )
}
