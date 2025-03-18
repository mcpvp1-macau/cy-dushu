import { useAppMsg } from '@/hooks/useAppMsg'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { useSearchParams } from 'react-router-dom'
import BO from '../../components/ButtonOperator'

type PropsType = {
  disabled?: boolean
}

/** 航线编辑底部按钮栏 */
const BottomOperator: FC<PropsType> = memo(({ disabled }) => {
  const msgApi = useAppMsg()
  const { t } = useTranslation()

  const [searchParams] = useSearchParams()
  const modelName = searchParams.get('modelName')
  const deviceId = searchParams.get('deviceId')

  const invalidate = () => {
    const { airlineConfig, airpointsConfig } = useAirlineConfigStore.getState()
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
    // 由于只有事件中才需要, 状态更新时不需要通知该组件 render, 所以不需要 hook useAirlineConfigStore
    const { airlineConfig, airpointsConfig, airlineTemplateInfo } =
      useAirlineConfigStore.getState()
    const getTaskName = () =>
      airlineTemplateInfo.taskName || t('wayline.executeTask.defaultTaskName')
    const data: Record<string, any> = {
      taskName: getTaskName(),
      templateId: airlineTemplateInfo.templateId,
      // deviceIds: deviceId,
      deviceType: 'UAV',
      // type: type,
      taskTemplateInfo: {
        taskBasic: JSON.stringify({
          ...airlineConfig,
          modelName: modelName ? atob(modelName) : undefined,
        }),
        defaultDeviceId: deviceId,
        parameters: {
          spaces: [
            {
              spaceId: 'MAP',
              spaceType: 'MAP',
              positions: airpointsConfig.map((e, i) => ({
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
      generateTaskData={generateTaskData}
      invalidate={invalidate}
    />
  )
})

BottomOperator.displayName = 'BottomOperator'

export default BottomOperator
