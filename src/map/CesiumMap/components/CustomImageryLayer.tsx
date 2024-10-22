import { useMapLayerAndOverlayConfigStore } from '@/store/map/useLayerAndOverlay.store'
import { memo, type FC } from 'react'
import createUrlTemplateImageryProvider from './CustomUrlTemplateImageryProvider'
import { ImageryLayer } from 'resium'

type PropsType = unknown

const CustomImageryLayer: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: ['getLocalSpaceList'],
      queryFn: async () => {
        return local.getItem<API_LAYER_OVERLAY.domain.SpaceItem[]>('space_list')
      },
    },
    queryClient,
  )

  const activeSpaceIds = useMapLayerAndOverlayConfigStore(
    (s) => s.activeSpaceIds,
  )

  const providers = useMemo(() => {
    if (!data || !activeSpaceIds || activeSpaceIds.size === 0) {
      return []
    }
    const map = new Map(data.map((e) => [e.spaceId, e]))

    return Array.from(activeSpaceIds)
      .filter((e) => {
        const space = map.get(e)
        return space?.spaceType === 'XYZ'
      })
      .map((e) => {
        const CustomUrlTemplateImageryProvider =
          createUrlTemplateImageryProvider(() => true)
        const provider = new CustomUrlTemplateImageryProvider({
          url: map.get(e)!.spaceMapUrl,
        })
        provider.errorEvent.addEventListener(() => {})
        return provider
      })
  }, [data, activeSpaceIds])

  return (
    <>
      {providers.map((provider, index) => (
        <ImageryLayer key={index} imageryProvider={provider} />
      ))}
    </>
  )
})

CustomImageryLayer.displayName = 'CustomImageryLayer'

export default CustomImageryLayer
