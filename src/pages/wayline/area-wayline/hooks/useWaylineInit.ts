import { getAirlineTemplateList } from '@/service/modules/airline'
import { shouldJson } from '@/utils/json'
import { useSearchParams } from 'react-router-dom'
import { pick } from 'lodash'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import { resolveAirlineConifg } from '../../edit/hooks/useAirlineInit'
import { addPaddingToRectangle } from '@/utils/cesium/rectangle'
import { useGlobalCesium } from '@/store/map/useGlobalMap.store'
import * as Cesium from 'cesium'

/** 航线信息初始化 */
const useAirlineInit = () => {
  const updateAirlineTemplateInfo = useAreaWaylineStore(
    (s) => s.updateTemplateConfig,
  )

  const updateAirlineConfig = useAreaWaylineStore((s) => s.updateAirlineConfig)

  // 相机参数
  const updateCameraInfo = useAreaWaylineStore((s) => s.updateCameraInfo)

  // 复原由路由参数传递的数据  ------------------------------
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const name = searchParams.get('name')
    if (name) {
      updateAirlineTemplateInfo({
        ...useAreaWaylineStore.getState().templateConfig,
        taskName: name,
      })
    }

    const camera = shouldJson(searchParams.get('camera') ?? '')
    updateAirlineConfig({
      ...useAreaWaylineStore.getState().airlineConfig,
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
        ...useAreaWaylineStore.getState().airlineConfig,
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

    updateCameraInfo({
      focal: camera?.focal ?? 24,
      sensorWidth: camera?.sensorWidth ?? 40,
      sensorHeight: camera?.sensorHeight ?? 30,
    })

    const o2 = pick(waylineConfig, ['coverage', 'mainK', 'polygon'])
    updateAirlineTemplateInfo({
      polygon: o2.polygon,
      mainK: o2.mainK,
      coverage: o2.coverage,
    })

    if (Array.isArray(o2.polygon)) {
      const rect = addPaddingToRectangle(
        Cesium.Rectangle.fromCartographicArray(
          o2.polygon.map((e) => Cesium.Cartographic.fromDegrees(e[0], e[1])),
        ),
        0.2,
      )
      viewer?.camera.flyTo({
        destination: rect,
        duration: 1,
      })
    }
  }, [data])

  useEffect(() => {
    return () => {
      useAreaWaylineStore.getState().reset()
    }
  }, [])

  return { isLoading }
}

export default useAirlineInit
