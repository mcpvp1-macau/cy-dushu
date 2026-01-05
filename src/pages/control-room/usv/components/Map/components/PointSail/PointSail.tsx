import PositionPickListener from '@/components/map/PositionPickListener'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'
import UsvPointSailConfirm from './Confirm'
import UsvPointSailTarget from './Target'
import UsvPointSailForecast from './Forecast'

const PointSail: FC = memo(() => {
  const pointSail = useUsvControlRoomStore((s) => s.pointSail)
  const updatePointSail = useUsvControlRoomStore((s) => s.updatePointSail)
  const postDeviceService = usePostDeviceService()
  const displayMode = useUsvControlRoomStore((s) => s.state.displayMode)

  const handleClick = (longitude: number, latitude: number) => {
    updatePointSail({
      open: true,
      targetPosition: [longitude, latitude],
    })
  }

  const handleCancel = () => {
    updatePointSail({
      open: false,
      targetPosition: null,
    })
  }

  const handleConfirm = async () => {
    if (!pointSail.targetPosition) return

    // 业务规则：指点航行确认后，先设置指点航行再启动任务
    await postDeviceService('setMission', {
      targetLongitude: pointSail.targetPosition[0],
      targetLatitude: pointSail.targetPosition[1],
    })
    await postDeviceService('startMission')
    handleCancel()
  }

  return (
    <>
      {pointSail.open && <PositionPickListener onClick={handleClick} />}
      {pointSail.targetPosition && (
        <>
          <UsvPointSailTarget position={pointSail.targetPosition} />
          <UsvPointSailConfirm
            position={pointSail.targetPosition}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
          />
        </>
      )}
      {(displayMode?.includes('指点航线') ||
        displayMode?.includes('指点航行')) && <UsvPointSailForecast />}
    </>
  )
})

PointSail.displayName = 'PointSail'

export default PointSail
