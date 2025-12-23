import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'

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

  const togglePointSail = () => {
    updatePointSail({
      open: !pointSailOpen,
      targetPosition: null,
    })
  }

  return (
    <div className="flex size-full items-center justify-start gap-3 px-4">
      <Button type="primary" onClick={handleStartMission} disabled={!serviceHave?.startMission}>
        {t('controlRoom.usv.operations.startMission', { defaultValue: '开始任务' })}
      </Button>
      <Button onClick={handlePauseMission} disabled={!serviceHave?.pauseMission}>
        {t('controlRoom.usv.operations.pauseMission', { defaultValue: '暂停任务' })}
      </Button>
      <Button danger onClick={handleStopMission} disabled={!serviceHave?.stopMission}>
        {t('controlRoom.usv.operations.stopMission', { defaultValue: '结束任务' })}
      </Button>
      <Button type={pointSailOpen ? 'primary' : 'default'} onClick={togglePointSail}>
        {t('controlRoom.usv.pointSail.title', { defaultValue: '指点航行' })}
      </Button>
    </div>
  )
})

OperationsPanel.displayName = 'OperationsPanel'

export default OperationsPanel
