import AppSpin from '@/components/AppSpin'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getSpaceList } from '@/service/modules/layer_overlay'
import MapSpaceConfig from './MapSpaceConfig'
import { useAsyncEffect } from 'ahooks'
import AppEmpty from '@/components/AppEmpty'
import { emtpyArray } from '@/constant/data'

type PropsType = {
  searchKw?: string
}

const MapSpaceListConfig: FC<PropsType> = memo((props) => {
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

  const renderData = useMemo(() => {
    return (
      data?.filter((e) => e.spaceName.includes(props.searchKw ?? '')) ||
      emtpyArray
    )
  }, [data, props.searchKw])

  if (isLoading || !data) {
    return <AppSpin />
  }

  return (
    <ScrollArea className="p-3">
      {renderData.length > 0 ? (
        <div className="flex flex-col gap-3">
          {renderData.map((e) => (
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
