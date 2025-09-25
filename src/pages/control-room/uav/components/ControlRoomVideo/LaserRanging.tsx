import Sight from '@/components/device/Sight'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'

type PropsType = unknown

/** 激光测距 */
const LaserRanging: FC<PropsType> = memo(() => {
  const distance = useUavControlRoomStore((s) => {
    // 在未打开的时候, 可以避免组件 render
    if (!s.openLarser) return undefined
    return s.state.laserDistance?.toFixed(1)
  })
  const openLarser = useUavControlRoomStore((s) => s.openLarser)

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 pointer-events-none z-10">
      <Sight color={openLarser ? '#dc2626' : '#e5e5e5'} />
      {distance && (
        <div
          className="absolute left-1/2 top-1/2 text-white text-sm p-1"
          style={{
            textShadow: '1px 1px 1px #0009',
          }}
        >
          {distance}m
        </div>
      )}
    </div>
  )
})

LaserRanging.displayName = 'LaserRanging'

export default LaserRanging
