import { useSearchParams } from 'react-router-dom'
import BO from '../../components/ButtonOperator'
import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'
import { DeviceEnum } from '@/enum/device'

type PropsType = {
  disabled?: boolean
}

/** 航线编辑底部按钮栏 */
const BottomOperator: FC<PropsType> = memo(({ disabled }) => {
  const { t } = useTranslation()

  const [searchParams] = useSearchParams()
  const deviceId = searchParams.get('deviceId')

  const invalidate = () => {
    return false
  }

  const generateTaskData = () => {
    const { waylineConfig, waypointsConfig, waylineTemplateInfo } =
      useRebotDogWaylineStore.getState()

    const getTaskName = () =>
      waylineTemplateInfo.taskName || t('wayline.executeTask.defaultTaskName')

    const taskBasic = {
      ...waylineConfig,
      waylineType: 'rebot_dog_wayline',
    }

    const data: Record<string, any> = {
      taskName: getTaskName(),
      templateId: waylineTemplateInfo.templateId,
      deviceType: DeviceEnum.ROBOT_DOG,
      taskTemplateInfo: {
        taskBasic: JSON.stringify(taskBasic),
        defaultDeviceId: deviceId,
        parameters: {
          spaces: [
            {
              spaceId: 'MAP',
              spaceType: 'MAP',
              positions: waypointsConfig.map((e, i) => ({
                ...e,
                positionIndex: i,
              })),
            },
          ],
        },
      },
    }
    return data
  }

  return (
    <BO
      disabled={disabled}
      deviceType={DeviceEnum.ROBOT_DOG}
      generateTaskData={generateTaskData}
      invalidate={invalidate}
    />
  )
})

BottomOperator.displayName = 'BottomOperator'

export default BottomOperator
