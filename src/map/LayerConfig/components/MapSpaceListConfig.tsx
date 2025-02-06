import AppSpin from '@/components/AppSpin'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getSpaceList } from '@/service/modules/layer_overlay'
import MapSpaceConfig from './MapSpaceConfig'
import { useAsyncEffect } from 'ahooks'
import AppEmpty from '@/components/AppEmpty'

type PropsType = unknown

const MapSpaceListConfig: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['getSpaceList'],
      queryFn: getSpaceList,
      select: (d) => d.data.rows,
    },
    queryClient,
  )

  useAsyncEffect(async () => {
    if (data) {
      await local.setItem('space_list', data)
      await queryClient.invalidateQueries({
        queryKey: ['getLocalSpaceList'],
      })
    }
  }, [data])

  if (isLoading || !data) {
    return <AppSpin />
  }

  return (
    <ScrollArea className="p-3 max-h-[384px]">
      {data?.length > 0 ? (
        <div className="flex flex-col gap-3">
          {data.map((e) => (
            <MapSpaceConfig key={e.id} data={e} />
          ))}
        </div>
      ) : (
        <AppEmpty />
      )}
    </ScrollArea>
  )
})

MapSpaceListConfig.displayName = 'MapSpaceListConfig'

export default MapSpaceListConfig
