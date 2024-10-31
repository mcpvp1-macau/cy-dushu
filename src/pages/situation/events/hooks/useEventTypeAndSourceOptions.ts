import { getEventTypeAndSourceList } from '@/service/modules/events'

/** 事件来源和类型选项 */
const useEventTypeAndSourceOptions = () => {
  const queryClient = useQueryClient()

  const { data: tsData, isLoading: tsIsLoading } = useQuery(
    {
      queryKey: ['getEventTypeAndSourceList'],
      queryFn: getEventTypeAndSourceList,
      select: (d) => d.data,
      staleTime: Infinity,
    },
    queryClient,
  )

  return [
    useMemo(() => {
      if (!tsData) {
        return [[], []]
      }

      return [
        tsData.eventSourceList
          ?.map((r) => {
            for (const key in r) {
              return { label: r[key], value: key }
            }
            return { label: '', value: '' }
          })
          .filter((e) => !!e.value) ?? [],
        tsData.eventTypeList
          ?.map((r) => {
            for (const key in r) {
              return { label: r[key], value: key }
            }
            return { label: '', value: '' }
          })
          .filter((e) => !!e.value) ?? [],
      ]
    }, [tsData]),
    tsIsLoading,
  ] as const
}

export default useEventTypeAndSourceOptions
