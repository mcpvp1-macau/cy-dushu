import useReconstructionMap from '@/store/map/useReconstructionMap.store'
import {
  getLayerGroupList,
  getLayerList,
  getReconstruction2DList,
} from '@/service/modules/reconstruction'
import { memo } from 'react'
import useReconstruction2DMapStore from '@/store/map/useReconstruction2DMap.store'
import useDelayState from '@/hooks/useDelay'

const ReconstructionMap: FC = memo(() => {
  const updateLayerGroupList = useReconstructionMap(
    (state) => state.updateLayerGroupList,
  )
  const updateLayerList = useReconstructionMap((state) => state.updateLayerList)
  const queryClient = useQueryClient()

  const openLayer = useDelayState(2000)

  const { data: groupList } = useQuery(
    {
      queryKey: ['reconstruction-groupList'],
      queryFn: () => getLayerGroupList(),
      select: (d) => d.data,
      enabled: openLayer,
    },
    queryClient,
  )

  useEffect(() => {
    if (!groupList) {
      return
    }
    updateLayerGroupList(groupList)
  }, [groupList])

  const { data: layerList } = useQuery(
    {
      queryKey: ['reconstruction-layerList'],
      queryFn: async () =>
        getLayerList({ layerIds: groupList!.map((e) => e.id) || [] }),
      select: (d) => d.data,
      enabled: !!groupList,
    },
    queryClient,
  )

  useEffect(() => {
    if (!layerList) {
      return
    }
    updateLayerList(layerList)
  }, [layerList])

  const { data: reconstruction2dList } = useQuery({
    queryKey: ['reconstruction2dList'],
    queryFn: () => getReconstruction2DList({}),
    enabled: openLayer,
    select: (d) => d.data,
  })

  useEffect(() => {
    if (!reconstruction2dList) {
      return
    }
    useReconstruction2DMapStore
      .getState()
      .updateReconstruction2DList(reconstruction2dList)
  }, [reconstruction2dList])

  return null
})

ReconstructionMap.displayName = 'ReconstructionMap'

export default ReconstructionMap
