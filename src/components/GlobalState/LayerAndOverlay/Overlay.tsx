import { getOverlayList } from '@/service/modules/layer_overlay'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { memo, type FC } from 'react'

type PropsType = unknown

const Overlay: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()

  const layerList = useMapLayerAndOverlayStore((s) => s.layerList)
  const layerIds = useMemo(() => layerList.map((e) => e.layerId), [layerList])

  const { data } = useQuery(
    {
      queryKey: ['overlayList', layerIds],
      queryFn: () => getOverlayList({ layerIds }),
      enabled: layerIds.length > 0,
      select: (d) => d.data.rows,
    },
    queryClient,
  )
  const updateOverlayList = useMapLayerAndOverlayStore(
    (s) => s.updateOverlayList,
  )
  useEffect(() => {
    if (data) {
      updateOverlayList(data)
    }
  }, [data])

  return null
})

Overlay.displayName = 'Overlay'

export default Overlay
