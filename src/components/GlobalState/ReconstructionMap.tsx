import useReconstructionMap from '@/store/map/useReconstructionMap.store'
import {
  getLayerGroupList,
  getLayerList,
} from '@/service/modules/reconstruction'
import { memo } from 'react'

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

  return <></>
})

ReconstructionMap.displayName = 'ReconstructionMap'

export default ReconstructionMap
