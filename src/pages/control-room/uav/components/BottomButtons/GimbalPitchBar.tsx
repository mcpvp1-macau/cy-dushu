import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { isNil } from 'lodash'
import { memo, type FC } from 'react'

type PropsType = unknown

const GimbalPitchBar: FC<PropsType> = memo(() => {
  const gimbalPitch = useUavControlRoomStore((s) => s.state.gimbalPitch) ?? 0

  const radio = Math.min(1, Math.abs(gimbalPitch) / 120)

  return (
    <>
      <div className="h-[72px] w-2 border border-solid border-black bg-white bg-opacity-15 relative  pointer-events-none">
        {!isNil(gimbalPitch) && (
          <span
            className="absolute top-0 -translate-y-[120%] -translate-x-[8px] text-green-500 whitespace-nowrap"
            style={{ textShadow: '0 0 2px #000' }}
          >
            θ {gimbalPitch.toFixed?.(0)}°
          </span>
        )}
        <div
          className={clsx('absolute inset-0 bg-primary', {
            'bottom-1/2 origin-bottom': gimbalPitch >= 0,
            'top-1/2 origin-top': gimbalPitch < 0,
          })}
          style={{ transform: `scaleY(${radio})` }}
        />
        <div className="absolute right-0 h-[2px] w-3 top-1/2 bg-white -translate-y-1/2 " />
      </div>
    </>
  )
})

GimbalPitchBar.displayName = 'GimbalPitchBar'

export default GimbalPitchBar
