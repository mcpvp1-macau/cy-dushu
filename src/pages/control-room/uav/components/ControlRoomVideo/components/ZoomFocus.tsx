import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'
import { Mode } from '../../AsideToolBar/ZoomFucusMode/constants'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { pick } from 'lodash'
import { useShallow } from 'zustand/react/shallow'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDebounceFn, useThrottleFn } from 'ahooks'

type PropsType = unknown

const InnerZoomFocus: FC<PropsType> = () => {
  const { productKey, deviceId } = useDeviceDetailStore(
    useShallow((s) => pick(s, ['productKey', 'deviceId'])),
  )
  const postDeviceService = usePostDeviceService(productKey, deviceId)

  const lens = useUavControlRoomStore((s) => s.state.lensType)

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const { run: clear } = useDebounceFn(
    () => {
      setPos(null)
    },
    { wait: 1500 },
  )

  const { run: handleClick } = useThrottleFn(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const x = e.nativeEvent.offsetX / e.currentTarget.clientWidth
      const y = e.nativeEvent.offsetY / e.currentTarget.clientHeight
      setPos({ x, y })
      postDeviceService('focusPoint', { lens, x, y }, '对焦')
      clear()
    },
    {
      wait: 500,
    },
  )

  return (
    <div
      className="absolute inset-0 pointer-events-auto overflow-hidden"
      onClick={handleClick}
    >
      {pos && (
        <div
          key={JSON.stringify(pos)}
          className="w-20 h-20 border border-yellow-500 absolute animate-in zoom-in-125 duration-500 opacity-80 pointer-events-none"
          style={{
            left: `calc(${pos.x * 100}% - 40px)`,
            top: `calc(${pos.y * 100}% - 40px)`,
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-yellow-500 w-[1px] h-2" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-yellow-500 w-[1px] h-2" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-yellow-500 w-2 h-[1px]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-yellow-500 w-2 h-[1px]" />
        </div>
      )}
    </div>
  )
}

InnerZoomFocus.displayName = 'InnerZoomFocus'

/** 点对焦 */
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
