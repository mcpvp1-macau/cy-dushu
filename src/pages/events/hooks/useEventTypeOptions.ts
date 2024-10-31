import { getEventTypeList } from '@/service/modules/events'

/** 事件类型选项 */
const useEventTypeOptions = () => {
  const queryClient = useQueryClient()
  const { data: eventData } = useQuery(
    {
      queryKey: ['getEventTypeList'],
      queryFn: getEventTypeList,
      select: (d) => d.data.rows,
      staleTime: Infinity, // 永不过期
    },
    queryClient,
  )

  const eventTypeOptions = useMemo(() => {
    return (
      eventData?.map((e) => ({
        label: e.eventName,
        value: e.eventType,
      })) ?? []
    )
  }, [eventData])

  return eventTypeOptions
}

export default useEventTypeOptions
