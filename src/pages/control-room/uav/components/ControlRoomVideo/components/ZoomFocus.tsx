import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'
import { Mode } from '../../AsideToolBar/ZoomFucusMode/constants'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { pick } from 'lodash'
import { useShallow } from 'zustand/react/shallow'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'

type PropsType = unknown

const InnerZoomFocus: FC<PropsType> = () => {
  const { productKey, deviceId } = useDeviceDetailStore(
    useShallow((s) => pick(s, ['productKey', 'deviceId'])),
  )
  const postDeviceService = usePostDeviceService(productKey, deviceId)

  const lens = useUavControlRoomStore((s) => s.state.lensType)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = e.nativeEvent.offsetX / e.currentTarget.clientWidth
    const y = e.nativeEvent.offsetY / e.currentTarget.clientHeight
    postDeviceService('focusPoint', { lens, x, y })
  }

  return (
    <div
      className="absolute inset-0 bg-red-50 pointer-events-auto"
      onClick={handleClick}
    ></div>
  )
}

InnerZoomFocus.displayName = 'InnerZoomFocus'

const ZoomFocus: FC<PropsType> = memo(() => {
  const zoomFocusMode = useUavControlRoomStore((s) => s.state.zoomFocusMode)
  const has = useDeviceDetailStore((s) => s.serviceHave['focusPoint'])

  if (!has || zoomFocusMode !== Mode.MF) {
    return null
  }

  return <InnerZoomFocus />
})

ZoomFocus.displayName = 'ZoomFocus'

export default ZoomFocus
