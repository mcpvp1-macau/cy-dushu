import { getWaylineTemplateList } from '@/service/modules/wayline'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { shouldJson } from '@/utils/json'
import { useSearchParams } from 'react-router-dom'
import { resolvePositions } from '../utils'
import { pick } from 'lodash'
import { useGlobalCesium } from '@/store/map/useGlobalMap.store'
import * as Cesium from 'cesium'
import { createROIfromRotation } from '@/utils/cesium/rotation'

export const resolveAirlineConifg = (config: any) => {
  for (const key of [
    'height',
    'speed',
    'globalRTHHeight',
    'takeOffSecurityHeight',
    'globalTransitionalSpeed',
  ]) {
    if (config[key]) {
      config[key] = Number(config[key])
    }
  }
  return config
}

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
        taskName: name,
      })
    }

    const camera = shouldJson(searchParams.get('camera') ?? '')
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
      const takeoffRef = shouldJson(takeoffRefQ)
      updateAirlineConfig({
        ...useAirlineConfigStore.getState().airlineConfig,
        takeOffRefPoint: takeoffRef,
      })
    }

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
          'duration',
          'distance',
        ])
        if (t.camera) {
          const cameraParams = shouldJson(camera?.defaultParam)
          if (cameraParams) {
            updateCameraInfo({
              focal: cameraParams.focal ?? 24,
              sensorWidth: cameraParams.sensorWidth ?? 40,
              sensorHeight: cameraParams.sensorHeight ?? 30,
            })
          }
        }
        updateAirlineConfig(resolveAirlineConifg(o))
      }
    }

    const parameters = searchParams.get('parameters')
    if (parameters) {
      const airpoints = shouldJson(parameters)?.spaces?.[0]?.positions
      updateAirpointsConfig(resolvePositions(airpoints))
    }
  }, [])

  // 复原详情数据 ------------------------------
  const { waylineTemplateId } = useParams()
  const queryClient = useQueryClient()
  const { data, isLoading, isRefetching } = useQuery(
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

  const viewer = useGlobalCesium()

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
    const parameters = shouldJson(data.parameters)
    const points = resolvePositions(parameters?.spaces?.at(0)?.positions)
    updateCameraInfo({
      focal: camera?.focal ?? 24,
      sensorWidth: camera?.sensorWidth ?? 40,
      sensorHeight: camera?.sensorHeight ?? 30,
    })

    if (points) {
      updateAirpointsConfig(points)
      if (points.length > 0) {
        const hHeight = waylineConfig.takeOffRefPoint?.[2] ?? 0
        const position = createROIfromRotation(
          Cesium.Cartographic.fromDegrees(
            points[0].pointX,
            points[0].pointY,
            points[0].pointZ + hHeight,
          ),
          new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(180),
            Cesium.Math.toRadians(45),
            Cesium.Math.toRadians(0),
          ),
          1000,
        )
        viewer?.camera.flyTo({
          destination: position,
          duration: 1,
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45),
            roll: Cesium.Math.toRadians(0),
          },
        })
      }
    }
  }, [data])

  return { isLoading: isLoading || isRefetching }
}

export default useAirlineInit
