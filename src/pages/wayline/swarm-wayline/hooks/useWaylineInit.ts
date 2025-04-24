import { getAirlineTemplateList } from '@/service/modules/airline'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { shouldJson } from '@/utils/json'
import { useSearchParams } from 'react-router-dom'
import { pick } from 'lodash'
import { resolveAirlineConifg } from '../../edit/hooks/useAirlineInit'
import useSwarmWaylineStore from '@/store/wayline/uav-swarm-wayline/useSwarmWayline.store'

/** 航线信息初始化 */
const useSwarmWaylineInit = () => {
  const updateAirlineTemplateInfo = useSwarmWaylineStore(
    (s) => s.updateTemplateConfig,
  )

  const updateAirlineConfig = useSwarmWaylineStore((s) => s.updateAirlineConfig)

  // 复原由路由参数传递的数据  ------------------------------
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const name = searchParams.get('name')
    if (name) {
      updateAirlineTemplateInfo({
        ...useAirlineConfigStore.getState().airlineTemplateInfo,
        taskName: name,
      })
    }

    updateAirlineConfig({
      ...useAirlineConfigStore.getState().airlineConfig,
    })

    const taskBasic = searchParams.get('taskBasic')
    if (taskBasic) {
      const t = shouldJson(taskBasic)
      if (t) {
        const o = pick(t, [
          'finishAction',
          'flyToWaylineMode',
          'gimbalPitchMode',
          'globalRTHHeight',
          'height',
          'imageFormat',
          'speed',
          'takeOffRefPoint',
          'takeOffSecurityHeight',
          'waypointHeadingMode',
          'globalTransitionalSpeed',
          'globalWaypointTurnMode',
        ])
        updateAirlineConfig(resolveAirlineConifg(o))

        const o2 = pick(t, ['coverage', 'mainK', 'polygon'])
        updateAirlineTemplateInfo({
          polygon: o2.polygon,
          mainK: o2.mainK,
          coverage: o2.coverage,
        })
      }
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
      updateAirlineConfig({ camera, ...resolveAirlineConifg(waylineConfig) })
    }

    const o2 = pick(waylineConfig, ['coverage', 'mainK', 'polygon'])
    updateAirlineTemplateInfo({
      polygon: o2.polygon,
      mainK: o2.mainK,
      coverage: o2.coverage,
    })
  }, [data])

  useEffect(() => {
    return () => {
      useSwarmWaylineStore.getState().reset()
    }
  }, [])

  return { isLoading }
}

export default useSwarmWaylineInit
