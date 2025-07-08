import { useAppMsg } from '@/hooks/useAppMsg'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import { useSearchParams } from 'react-router-dom'
import BO from '../../components/ButtonOperator'
import { calcFovRadiation } from '@/utils/fov'
import { round } from 'lodash'

type PropsType = unknown

const BottomButtions: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const [searchParams] = useSearchParams()
  const deviceId = searchParams.get('deviceId')

  const msgApi = useAppMsg()

  const invalidate = () => {
    const { airlineConfig, airpointsConfig } = useAreaWaylineStore.getState()
    if ((airpointsConfig?.length ?? 0) < 2) {
      msgApi.error(t('wayline.executeTask.error.waypointNotEnough'))
      return true
    }
    if (!airlineConfig.globalRTHHeight) {
      msgApi.error(t('wayline.executeTask.error.rthHeightNotSet'))
      return true
    }
    return false
  }

  const generateTaskData = () => {
    const { airlineConfig, airpointsConfig, templateConfig } =
      useAreaWaylineStore.getState()

    const taskBasic = {
      ...airlineConfig,
      coverage: templateConfig.coverage,
      mainK: templateConfig.mainK,
      polygon: templateConfig.polygon,
      waylineType: 'area_waypoint',
    }

    const parameters = {
      spaces: [
        {
          spaceId: 'MAP',
          spaceType: 'MAP',
          positions: airpointsConfig,
        },
      ],
    }

    // 处理等距拍照/等时拍照
    if (
      ['multipleTiming', 'multipleDistance'].includes(
        taskBasic.actionTriggerType,
      )
    ) {
      const intervalDistance =
        Math.tan(calcFovRadiation(4.5, 4.8, 1) / 2) *
        taskBasic.height *
        2 *
        (1 - useAreaWaylineStore.getState().templateConfig.photoWaylineCoverage)
      if (taskBasic.actionTriggerType === 'multipleDistance') {
        taskBasic.actionTriggerParam = round(intervalDistance, 2)
      } else {
        taskBasic.actionTriggerParam = round(
          intervalDistance / taskBasic.globalTransitionalSpeed,
          2,
        )
      }
    }

    const data: Record<string, any> = {
      taskName:
        templateConfig.taskName || t('wayline.executeTask.defaultTaskName'),
      templateId: templateConfig.templateId || undefined,
      deviceType: 'UAV',
      taskTemplateInfo: {
        taskBasic: JSON.stringify(taskBasic),
        defaultDeviceId: deviceId || undefined,
        parameters: parameters,
      },
    }
    return data
  }

  return <BO generateTaskData={generateTaskData} invalidate={invalidate} />
})

BottomButtions.displayName = 'BottomButtions'

export default BottomButtions
