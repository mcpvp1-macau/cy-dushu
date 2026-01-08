import { useTimeline } from '@/components/Timeline/hooks/context'
import { dft } from '@/constant/time-fmt'
import { getActiveTrackPeriods } from '@/service/modules/db-api'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { memo, type FC } from 'react'

type PropsType = {
  deviceId: string
}

/** 该组件表示哪些有数据 */
const DataPeriod: FC<PropsType> = memo(({ deviceId }) => {
  const timeRange = useBackTrackingStore((s) => s.timeRange)

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
      select: (data) => data?.data,
    },
    queryClient,
  )

  const timeRangeList = useMemo(() => {
    if (!data) {
      return []
    }
    return data.map((e) => {
      const [start, end] = e.timeRange?.split?.('¥') ?? []

      return [dayjs(start), dayjs(end)]
    })
  }, [data])

  const { timeline, dataSets, groupSets } = useTimeline()

  useEffect(() => {
    if (!dataSets || !timeline || !groupSets) {
      return
    }
    const dataPeriodIdPrefix = 'data-period-'
    const dataPeriodGroupId = 'time-range-group'
    const dataPeriodItemClassName = 'data-period-item'

    // 业务规则：数据段与时间范围同轨展示，保持对齐

    const removeIds = dataSets.getIds({
      filter: (item) =>
        typeof item?.id === 'string' && item.id.startsWith(dataPeriodIdPrefix),
    })

    if (removeIds.length) {
      dataSets.remove(removeIds)
    }

    if (!timeRangeList.length) {
      return
    }

    const periodItems = timeRangeList.reduce<
      {
        id: string
        type: 'background'
        start: string
        end: string
        content: string
        group: string
        className: string
        selectable: false
        editable: false
      }[]
    >((list, [start, end], index) => {
      // 过滤无效或倒序时间段，避免时间轴渲染异常
      if (!start?.isValid?.() || !end?.isValid?.()) {
        return list
      }

      const startTime = start.toDate()
      const endTime = end.toDate()

      if (startTime >= endTime) {
        return list
      }

      list.push({
        id: `${dataPeriodIdPrefix}${startTime.getTime()}-${endTime.getTime()}-${index}`,
        type: 'background',
        start: start.format(dft),
        end: end.format(dft),
        content: '',
        group: dataPeriodGroupId,
        className: dataPeriodItemClassName,
        selectable: false,
        editable: false,
      })

      return list
    }, [])

    if (periodItems.length) {
      for (const item of periodItems) {
        dataSets.add(item)
      }
    }
  }, [dataSets, groupSets, timeRangeList, timeline])

  return null
})

DataPeriod.displayName = 'DataPeriod'

export default DataPeriod
