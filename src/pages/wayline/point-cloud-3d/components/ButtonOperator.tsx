import { useAppMsg } from '@/hooks/useAppMsg'
import { useSearchParams } from 'react-router-dom'
import BO from '../../components/ButtonOperator'
import usePointCloud3DWaylineStore from '@/store/wayline/point-cloud-3d-wayline/usePointCloud3D.store'

type PropsType = {
  disabled?: boolean
}

/** 航线编辑底部按钮栏 */
const BottomOperator: FC<PropsType> = memo(({ disabled }) => {
  const msgApi = useAppMsg()
  const { t } = useTranslation()

  const [searchParams] = useSearchParams()
  const deviceId = searchParams.get('deviceId')

  const invalidate = () => {
    const { waypointsConfig } = usePointCloud3DWaylineStore.getState()
    if ((waypointsConfig?.length ?? 0) < 2) {
      msgApi.error(t('wayline.executeTask.error.waypointNotEnough'))
      return true
    }

    return false
  }

  const generateTaskData = () => {
    // 由于只有事件中才需要, 状态更新时不需要通知该组件 render, 所以不需要 hook useAirlineConfigStore
    const { waylineTemplateInfo, waypointsConfig, waylineConfig } =
      usePointCloud3DWaylineStore.getState()
    const getTaskName = () =>
      waylineTemplateInfo.taskName || t('wayline.executeTask.defaultTaskName')
    const data: Record<string, any> = {
      taskName: getTaskName(),
      templateId: waylineTemplateInfo.templateId,
      // deviceIds: deviceId,
      deviceType: 'ROBOT_DOG',
      type: 'point_cloud_3d',
      taskTemplateInfo: {
        taskBasic: JSON.stringify({
          ...waylineConfig,
          waylineType: 'point_cloud_3d',
          spaceId: waylineTemplateInfo.spaceId,
        }),
        defaultDeviceId: deviceId,
        parameters: {
          spaces: [
            {
              spaceId: waylineTemplateInfo.spaceId,
              spaceType: 'POINT_CLOUD_3D',
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
      generateTaskData={generateTaskData}
      invalidate={invalidate}
    />
  )
})

BottomOperator.displayName = 'BottomOperator'

export default BottomOperator
