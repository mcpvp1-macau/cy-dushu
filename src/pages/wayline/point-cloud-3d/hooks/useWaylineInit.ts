import { getSpaceDetail } from '@/service/modules/layer_overlay'
import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'
import { useSearchParams } from 'react-router-dom'

const usePointCloud3DWaylineInit = () => {
  const [spaceId, setSpaceId] = useState(0)
  const queryClient = useQueryClient()
  useQuery(
    {
      queryKey: ['spaceDetail', spaceId ?? 0],
      queryFn: async () => {
        const resp = await getSpaceDetail(spaceId)
        usePointCloud3DWaylineStore
          .getState()
          .updateSpaceMapUrl(resp.data.spaceMapUrl)
        return resp
      },
      enabled: !!spaceId,
    },
    queryClient,
  )

  // 复原由路由参数传递的数据  ------------------------------
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const name = searchParams.get('name')
    const store = usePointCloud3DWaylineStore.getState()
    if (name) {
      store.updateWaylineTemplateInfo({
        ...store.waylineTemplateInfo,
        taskName: name,
      })
    }
    const spaceId = searchParams.get('cloud3DSpaceId')
    if (spaceId) {
      setSpaceId(+spaceId)
    }
  }, [])
}

export default usePointCloud3DWaylineInit
