import { getAirlineTemplateList } from '@/service/modules/airline'

/** 获取所有航线和选项 */
const useAirlineOptions = () => {
  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: ['getAllAirlines'],
      queryFn: () =>
        getAirlineTemplateList({
          isPage: false,
        }),
      select: (d) => d.data.rows,
      staleTime: 1000 * 60 * 60,
    },
    queryClient,
  )

  const airlineOptions = useMemo(
    () =>
      data?.map((e, i) => ({
        label: e.taskName,
        value: i,
      })) ?? [],
    [data],
  )

  return {
    data,
    airlineOptions,
  }
}

export default useAirlineOptions
