import { getWaylineTemplateList } from '@/service/modules/wayline'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { shouldJson } from '@/utils/json'
import { useSearchParams } from 'react-router-dom'
import { pick } from 'lodash'
import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'
import { resolvePositions } from '../../edit/utils'

export const resolveAirlineConifg = (config: any) => {
  for (const key of ['speed']) {
    if (config[key]) {
      config[key] = Number(config[key])
    }
  }
  return config
}

/** 航线信息初始化 */
const useWaylineInit = () => {
  const updateWaylineTemplateInfo = useRebotDogWaylineStore(
    (s) => s.updateWaylineTemplateInfo,
  )

  const updateWaylineConfig = useRebotDogWaylineStore(
    (s) => s.updateWaylineConfig,
  )
  const updateWaypointsConfig = useRebotDogWaylineStore(
    (s) => s.updateWaypointsConfig,
  )

  // 复原由路由参数传递的数据  ------------------------------
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const name = searchParams.get('name')
    if (name) {
      updateWaylineTemplateInfo({
        ...useAirlineConfigStore.getState().airlineTemplateInfo,
        taskName: name,
      })
    }

    const taskBasic = searchParams.get('taskBasic')
    if (taskBasic) {
      const t = shouldJson(taskBasic)
      if (t) {
        const o = pick(t, ['speed'])
        updateWaylineConfig(resolveAirlineConifg(o))
      }
    }

    const parameters = searchParams.get('parameters')
    if (parameters) {
      const airpoints = shouldJson(parameters)?.spaces?.[0]?.positions
      updateWaypointsConfig(resolvePositions(airpoints))
    }
  }, [])

  // 复原详情数据 ------------------------------
  const { waylineTemplateId } = useParams()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['waylineTemplate', waylineTemplateId],
      queryFn: () =>
        getWaylineTemplateList({
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
    updateWaylineTemplateInfo({
      taskName: data.taskName,
      templateId: data.templateId,
      waylineTemplateId: data.waylineTemplateId,
    })
    const waylineConfig = shouldJson(data.taskBasic)

    if (waylineConfig) {
      updateWaylineConfig({ ...resolveAirlineConifg(waylineConfig) })
    }
    const parameters = shouldJson(data.parameters)
    const points = resolvePositions(parameters?.spaces?.at(0)?.positions)

    if (points) {
      updateWaypointsConfig(points)
    }
  }, [data])

  return { isLoading }
}

export default useWaylineInit
