import { getAirlineTemplateList } from '@/service/modules/airline'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { shouldJson } from '@/utils/json'
import { useSearchParams } from 'react-router-dom'
import { resolvePositions } from '../utils'

/** 航线信息初始化 */
const useAirlineInit = () => {
  const updateAirlineTemplateInfo = useAirlineConfigStore(
    (s) => s.updateAirlineTemplateInfo,
  )

  const updateAirlineConfig = useAirlineConfigStore(
    (s) => s.updateAirlineConfig,
  )
  const updateAirpointsConfig = useAirlineConfigStore(
    (s) => s.updateAirpointsConfig,
  )

  // 相机参数
  const updateCameraInfo = useAirlineConfigStore((s) => s.updateCameraInfo)

  // 复原由路由参数传递的数据  ------------------------------
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const name = searchParams.get('name')
    if (name) {
      updateAirlineTemplateInfo({
        ...useAirlineConfigStore.getState().airlineTemplateInfo,
        taskName: decodeURIComponent(name),
      })
    }

    const camera = shouldJson(
      decodeURIComponent(searchParams.get('camera') ?? ''),
    )
    updateAirlineConfig({
      ...useAirlineConfigStore.getState().airlineConfig,
      camera,
    })
    const cameraParams = shouldJson(camera?.defaultParam)
    if (cameraParams) {
      updateCameraInfo({
        focal: cameraParams.focal ?? 24,
        sensorWidth: cameraParams.sensorWidth ?? 40,
        sensorHeight: cameraParams.sensorHeight ?? 30,
      })
    }

    const takeoffRefQ = searchParams.get('takeoffRef')
    if (takeoffRefQ) {
      const takeoffRef = shouldJson(decodeURIComponent(takeoffRefQ))
      updateAirlineConfig({
        ...useAirlineConfigStore.getState().airlineConfig,
        takeOffRefPoint: takeoffRef,
      })
    }
  }, [])

  // 复原详情数据 ------------------------------
  const { waylineTemplateId } = useParams()
  const queryClient = useQueryClient()
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
    updateAirlineTemplateInfo({
      taskName: data.taskName,
      templateId: data.templateId,
      waylineTemplateId: data.waylineTemplateId,
    })
    const waylineConfig = shouldJson(data.taskBasic)
    const { camera } = waylineConfig

    if (waylineConfig) {
      updateAirlineConfig({ camera, ...waylineConfig })
    }
    const parameters = shouldJson(data.parameters)
    const points = resolvePositions(parameters?.spaces?.at(0)?.positions)
    updateCameraInfo({
      focal: camera?.focal ?? 24,
      sensorWidth: camera?.sensorWidth ?? 40,
      sensorHeight: camera?.sensorHeight ?? 30,
    })

    if (points) {
      updateAirpointsConfig(points)
    }
  }, [data])

  return { isLoading }
}

export default useAirlineInit
