import useReconstructionMap from '@/store/map/useReconstructionMap.store'
import {
  getLayerGroupList,
  getLayerList,
  getReconstruction2DList,
} from '@/service/modules/reconstruction'
import { memo } from 'react'
import useReconstruction2DMapStore from '@/store/map/useReconstruction2DMap.store'

const ReconstructionMap: FC = memo(() => {
  const updateLayerGroupList = useReconstructionMap(
    (state) => state.updateLayerGroupList,
  )
  const updateLayerList = useReconstructionMap((state) => state.updateLayerList)
  const queryClient = useQueryClient()

  const { data: groupList } = useQuery(
    {
      queryKey: ['reconstruction-groupList'],
      queryFn: () => getLayerGroupList(),
      select: (d) => d.data,
    },
    queryClient,
  )

  useEffect(() => {
    if (groupList) {
      updateLayerGroupList(groupList)
      const layerIds = groupList.map((item) => item.id)
      getLayerList({ layerIds }).then((d) => {
        updateLayerList(d.data)
      })
    }
  }, [groupList])

  const { data: reconstruction2dList } = useQuery({
    queryKey: ['reconstruction2dList'],
    queryFn: () => getReconstruction2DList({}),
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
