import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'
import { Button } from 'antd'
import ControlPower from './ControlPower'

const OperationsPanel: FC = memo(() => {
  const { t } = useTranslation()

  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const pointSailOpen = useUsvControlRoomStore((s) => s.pointSail.open)
  const updatePointSail = useUsvControlRoomStore((s) => s.updatePointSail)
  const postDeviceService = usePostDeviceService()

  const handleStartMission = useMemoizedFn(() => {
    // 业务规则：无对应物模型服务时不触发调用，避免接口报错
    if (!serviceHave?.startMission) return

    postDeviceService('startMission')
  })

  const handlePauseMission = useMemoizedFn(() => {
    if (!serviceHave?.pauseMission) return

    postDeviceService('pauseMission')
  })

  const handleStopMission = useMemoizedFn(() => {
    if (!serviceHave?.stopMission) return

    postDeviceService('stopMission')
  })

  const togglePointSail = useMemoizedFn(() => {
    updatePointSail({
      open: !pointSailOpen,
      targetPosition: null,
    })
  })

  return (
    <div className="size-full flex flex-col p-3 gap-3 justify-center">
      <ControlPower />
      <div className="flex items-center justify-center gap-3 w-full">
        <Button
          className="flex-1"
          type={pointSailOpen ? 'primary' : 'default'}
          onClick={togglePointSail}
        >
          {t('usv.pointSail.title', { defaultValue: '指点航行' })}
        </Button>
        <Button
          className="flex-1"
          type="primary"
          onClick={handleStartMission}
          disabled={!serviceHave?.startMission}
        >
          {t('usv.operations.startMission', {
            defaultValue: '开始任务',
          })}
        </Button>
        <Button
          className="flex-1"
          onClick={handlePauseMission}
          disabled={!serviceHave?.pauseMission}
        >
          {t('usv.operations.pauseMission', {
            defaultValue: '暂停任务',
          })}
        </Button>
        <Button
          className="flex-1"
          onClick={handleStopMission}
          disabled={!serviceHave?.stopMission}
        >
          {t('usv.operations.stopMission', {
            defaultValue: '结束任务',
          })}
        </Button>
      </div>
    </div>
  )
})

OperationsPanel.displayName = 'OperationsPanel'

export default OperationsPanel
