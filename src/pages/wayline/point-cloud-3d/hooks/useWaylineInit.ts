import { getAirlineTemplateList } from '@/service/modules/airline'
import { getSpaceDetail } from '@/service/modules/layer_overlay'
import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'
import { shouldJson } from '@/utils/json'
import { useSearchParams } from 'react-router-dom'
import { resolvePositions } from '../../edit/utils'

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
    const store = usePointCloud3DWaylineStore.getState()
    store.resetState()
    const name = searchParams.get('name')
    if (name) {
      store.updateWaylineTemplateInfo({
        ...store.waylineTemplateInfo,
        taskName: name,
      })
    }
    const spaceId = searchParams.get('cloud3DSpaceId')
    if (spaceId) {
      setSpaceId(+spaceId)
      store.updateWaylineTemplateInfo({
        ...store.waylineTemplateInfo,
        spaceId: +spaceId,
      })
    }
  }, [])

  // 复原详情数据 ------------------------------
  const { waylineTemplateId } = useParams()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['waylineTemplate', waylineTemplateId],
      queryFn: () =>
        getAirlineTemplateList({
          waylineTemplateId,
        }),
      enabled: !!waylineTemplateId,
      select: (d) => d.data?.rows?.at(0),
    },
    queryClient,
  )

  useEffect(() => {
    if (!data) {
      return
    }
    const sto = usePointCloud3DWaylineStore.getState()
    sto.updateWaylineTemplateInfo({
      taskName: data.taskName,
      templateId: data.templateId,
      waylineTemplateId: data.waylineTemplateId,
    })
    const waylineConfig = shouldJson(data.taskBasic)

    if (waylineConfig) {
      sto.updateWaylineConfig({
        obstacleMode: waylineConfig.obstacleMode,
        speed: waylineConfig.speed,
      })
      sto.updateWaylineTemplateInfo({
        ...sto.waylineTemplateInfo,
        spaceId: waylineConfig.spaceId,
      })
    }
    setSpaceId(waylineConfig?.spaceId ?? 0)
    const parameters = shouldJson(data.parameters)
    const points = resolvePositions(parameters?.spaces?.at(0)?.positions)

    if (points) {
      sto.updateWaypointsConfig(points)
    }
  }, [data])

  return { isLoading }
}

export default usePointCloud3DWaylineInit
