import { useAppMsg } from '@/hooks/useAppMsg'
import { useSearchParams } from 'react-router-dom'
import BO from '../../components/ButtonOperator'
import useSwarmWaylineStore from '@/store/uav/uav-swarm-wayline/useSwarmWayline.store'

type PropsType = unknown

const BottomButtions: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const [searchParams] = useSearchParams()
  const deviceId = searchParams.get('deviceId')

  const msgApi = useAppMsg()

  const invalidate = () => {
    const { airlineConfig, templateConfig } = useSwarmWaylineStore.getState()
    if ((templateConfig?.polygon?.length ?? 0) < 3) {
      msgApi.error(t('wayline.executeTask.error.polygonNotSet'))
      return true
    }
    if (!airlineConfig.globalRTHHeight) {
      msgApi.error(t('wayline.executeTask.error.rthHeightNotSet'))
      return true
    }
    return false
  }

  const generateTaskData = () => {
    const { airlineConfig, templateConfig } = useSwarmWaylineStore.getState()

    const taskBasic = {
      ...airlineConfig,
      coverage: templateConfig.coverage,
      mainK: templateConfig.mainK,
      polygon: templateConfig.polygon,
      waylineType: 'cluster_wayline',
    }

    const parameters = {}

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

  return (
    <BO
      generateTaskData={generateTaskData}
      allowMultipleDevice
      invalidate={invalidate}
    />
  )
})

BottomButtions.displayName = 'BottomButtions'

export default BottomButtions
