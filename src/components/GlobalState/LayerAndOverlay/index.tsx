import { getLayerList } from '@/service/modules/layer_overlay'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { memo, type FC } from 'react'
import Overlay from './Overlay'

type PropsType = unknown

const LayerAndOverlay: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()

  const { data } = useQuery(
    {
      queryKey: ['layerList'],
      queryFn: () => getLayerList(),
      select: (d) => d.data.rows,
    },
    queryClient,
  )

  const updateLayerList = useMapLayerAndOverlayStore(
    (state) => state.updateLayerList,
  )

  useEffect(() => {
    if (data) {
      updateLayerList(data)
    }
  }, [data])

  return <Overlay />
})

LayerAndOverlay.displayName = 'LayerAndOverlay'

export default LayerAndOverlay
