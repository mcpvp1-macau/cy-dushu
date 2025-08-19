import AppSpin from '@/components/AppSpin'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getSpaceList } from '@/service/modules/layer_overlay'
import MapSpaceConfig from './MapSpaceConfig'
import { useAsyncEffect } from 'ahooks'
import AppEmpty from '@/components/AppEmpty'
import { emtpyArray } from '@/constant/data'
import { useMapLayerAndOverlayConfigStore } from '@/store/map/useLayerAndOverlay.store'
type PropsType = {
  searchKw?: string
}

const MapSpaceListConfig: FC<PropsType> = memo((props) => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['getSpaceList'],
      queryFn: () => getSpaceList(),
      select: (d) => d?.data?.rows,
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

  const activeSpaceIds = useMapLayerAndOverlayConfigStore(
    (s) => s.activeSpaceIds,
  )
  const updateActiveSpaceIds = useMapLayerAndOverlayConfigStore(
    (s) => s.updateActiveSpaceIds,
  )
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
            <MapSpaceConfig
              key={e.id}
              data={e}
              checked={activeSpaceIds.has(e.spaceId)}
              onChange={(checked) => {
                if (checked) {
                  updateActiveSpaceIds(new Set([...activeSpaceIds, e.spaceId]))
                } else {
                  activeSpaceIds.delete(e.spaceId)
                  updateActiveSpaceIds(new Set(activeSpaceIds))
                }
              }}
            />
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
