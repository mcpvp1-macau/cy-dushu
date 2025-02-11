import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import React from 'react'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import PositionPickListener from '@/components/map/PositionPickListener'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

const DrawMapPosition = () => {
  //   const productKey = useWangLouControlRoomStore((s) => s.)
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useWangLouControlRoomStore((s) => s.deviceId)
  const isCameraChangePosition = useWangLouControlRoomStore(
    (s) => s.isCameraChangePosition,
  )
  const updateIsCameraChangePosition = useWangLouControlRoomStore(
    (s) => s.updateIsCameraChangePosition,
  )

  const uuid = useWangLouControlRoomStore((s) => s.uuid)

  const post = usePostDeviceService(productKey, deviceId)

  const onClick = (longitude: number, latitude: number, alt?: number) => {
    post('swerve', {
      longitude,
      latitude,
      altitude: alt || 0,
      controlTag: uuid,
    })

    updateIsCameraChangePosition({
      deviceId: deviceId!,
      productKey: productKey!,
      enabled: false,
    })
  }

  if (!isCameraChangePosition?.enabled) return null

  return <PositionPickListener onClick={onClick} />
}

export default React.memo(DrawMapPosition)
