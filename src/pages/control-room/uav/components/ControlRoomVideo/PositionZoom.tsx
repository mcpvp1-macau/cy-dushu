import DrawBox from '@/components/DrawBox'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'

type PropsType = unknown

const method: Record<number, string> = {
  1: 'tapZoomAtTarget',
  2: 'gimbalToPoint',
}

const PositionZoom: FC<PropsType> = memo(() => {
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const postService = usePostDeviceService(productKey, deviceId)

  const posizionZoomOpen = useUavControlRoomStore((s) => s.openPointZoom)

  const handleDrawEnd = ([x1, y1, x2, y2]: [
    number,
    number,
    number,
    number,
  ]) => {
    postService(method[posizionZoomOpen], { x1, y1, x2, y2 })
  }

  if (posizionZoomOpen === 0) {
    return null
  }

  return <DrawBox onDrawEnd={handleDrawEnd} />
})

PositionZoom.displayName = 'PositionZoom'

export default PositionZoom
