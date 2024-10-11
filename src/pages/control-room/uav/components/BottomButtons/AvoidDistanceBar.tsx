import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'

type PropsType = unknown

const AvoidDistanceBar: FC<PropsType> = memo(() => {
  const upAvoidDistance =
    useUavControlRoomStore((s) => s.state.upAvoidDistance) ?? 0
  const downAvoidDistance =
    useUavControlRoomStore((s) => s.state.downAvoidDistance) ?? 0

  const radioUp = Math.min(1, Math.abs(upAvoidDistance) / 20)
  const radioDown = Math.min(1, Math.abs(downAvoidDistance) / 20)

  return (
    <>
      <div className="h-[72px] w-2 border border-solid border-black bg-white bg-opacity-15 relative whitespace-nowrap pointer-events-none">
        <span
          className="absolute top-0 -translate-y-[120%] -translate-x-[12px] text-orange-500 text-sm"
          style={{ textShadow: '0 0 2px #000' }}
        >
          {upAvoidDistance?.toFixed?.(0)} m
        </span>
        <span
          className="absolute bottom-0 translate-y-[120%] -translate-x-[12px] text-orange-500 text-sm"
          style={{ textShadow: '0 0 2px #000' }}
        >
          {downAvoidDistance?.toFixed?.(0)} m
        </span>
        <div
          className={clsx(
            'absolute inset-0 bg-orange-400',
            'bottom-1/2 origin-bottom',
          )}
          style={{ transform: `scaleY(${radioUp})` }}
        />
        <div
          className={clsx(
            'absolute inset-0 bg-orange-400',
            'top-1/2 origin-top',
          )}
          style={{ transform: `scaleY(${radioDown})` }}
        />
        <div className="absolute left-0 h-[2px] w-3 top-1/2 bg-white -translate-y-1/2 " />
      </div>
    </>
  )
})

AvoidDistanceBar.displayName = 'GimbalPitchBar'

export default AvoidDistanceBar
