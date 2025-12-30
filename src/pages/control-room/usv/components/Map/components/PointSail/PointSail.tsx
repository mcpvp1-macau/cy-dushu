import PositionPickListener from '@/components/map/PositionPickListener'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'
import UsvPointSailConfirm from './Confirm'
import UsvPointSailTarget from './Target'

const PointSail: FC = memo(() => {
  const pointSail = useUsvControlRoomStore((s) => s.pointSail)
  const updatePointSail = useUsvControlRoomStore((s) => s.updatePointSail)
  const postDeviceService = usePostDeviceService()

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

    await postDeviceService('setMission', {
      targetLongitude: pointSail.targetPosition[0],
      targetLatitude: pointSail.targetPosition[1],
    })
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
    </>
  )
})

PointSail.displayName = 'PointSail'

export default PointSail
