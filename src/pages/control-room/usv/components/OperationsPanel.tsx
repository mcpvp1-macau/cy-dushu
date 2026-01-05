import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'
import { Button } from 'antd'
import ControlPower from './ControlPower'

const OperationsPanel: FC = memo(() => {
  const { t } = useTranslation()

  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const pointSailOpen = useUsvControlRoomStore((s) => s.pointSail.open)
  const hasControlPower = useUsvControlRoomStore((s) => s.hasControlPower)
  const updatePointSail = useUsvControlRoomStore((s) => s.updatePointSail)
  const postDeviceService = usePostDeviceService()
  const missionStatus = useUsvControlRoomStore((s) => s.state?.missionStatus)

  const missionStatusValue = useMemo(() => {
    if (missionStatus === undefined || missionStatus === null) return null

    const statusNumber = Number(missionStatus)

    return Number.isNaN(statusNumber) ? null : statusNumber
  }, [missionStatus])

  const isStopped = missionStatusValue === 0

  const handleStartMission = useMemoizedFn(() => {
    // 业务规则：无对应物模型服务时不触发调用，避免接口报错
    if (!serviceHave?.startMission || !hasControlPower) return

    postDeviceService('startMission')
  })

  const handlePauseMission = useMemoizedFn(() => {
    if (!serviceHave?.pauseMission || !hasControlPower) return
    postDeviceService('pauseMission')
  })

  const handleStopMission = useMemoizedFn(() => {
    if (!serviceHave?.stopMission || !hasControlPower) return

    postDeviceService('stopMission')
  })

  const togglePointSail = useMemoizedFn(() => {
    // 业务规则：无控制权时禁止切换指点航行，避免误触
    if (!hasControlPower) return

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
          disabled={!hasControlPower}
        >
          {t('usv.pointSail.title', { defaultValue: '指点航行' })}
        </Button>
        {isStopped ? (
          <Button
            className="flex-1"
            onClick={handleStartMission}
            disabled={!serviceHave?.startMission || !hasControlPower}
          >
            {t('usv.operations.continueMission', { defaultValue: '继续任务' })}
          </Button>
        ) : (
          <Button
            className="flex-1"
            onClick={handlePauseMission}
            disabled={!serviceHave?.pauseMission || !hasControlPower}
          >
            {t('usv.operations.pauseMission', {
              defaultValue: '暂停任务',
            })}
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={handleStopMission}
          disabled={!serviceHave?.stopMission || !hasControlPower}
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
