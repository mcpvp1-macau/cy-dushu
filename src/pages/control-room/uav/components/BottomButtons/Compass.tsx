import { memo, type FC } from 'react'
import compassRingImg from '@/assets/imgs/control/compass-ring.png'
import compassArrowImg from '@/assets/imgs/control/compass-arrow.svg'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import compassGimbalPointer from '@/assets/imgs/control/compass-gimbal-pointer.svg'

type PropsType = unknown

const Compass: FC<PropsType> = memo(() => {
  const uavYaw = useUavControlRoomStore((s) => s.state.uavYaw) ?? 0
  const gimbalYaw = useUavControlRoomStore((s) => s.state.gimbalYaw) ?? 0

  const uavRoll = useUavControlRoomStore((s) => s.state.uavRoll) ?? 0
  const uavPitch = useUavControlRoomStore((s) => s.state.uavPitch) ?? 0

  return (
    <div className="w-32 h-32 relative pointer-events-none">
      {/* 无人机姿态(横滚角) */}
      <div className="absolute inset-5 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 -left-80 -right-80 bg-gradient-to-b from-[#4c90f055] to-transparent"
          style={{
            top: `${((uavPitch + 90) / 180) * 100}%`,
            transformOrigin: 'top center',
            rotate: `${uavRoll}deg`,
          }}
        />
      </div>
      {/* 指南针 */}
      <div className="absolute inset-0" style={{ rotate: `${-uavYaw}deg` }}>
        <img src={compassRingImg} className="absolute inset-0 top-[-1px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img
            src={compassGimbalPointer}
            className="relateive translate-y-[-54px]"
            style={{ rotate: `${gimbalYaw}deg` }}
          />
        </div>
      </div>
      {/*  */}
      <div className="abs-center">
        <img src={compassArrowImg} className="scale-90" />
      </div>
      <div
        className="absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 text-green-500"
        style={{ textShadow: '0 0 2px #000' }}
      >
        ψ {uavYaw?.toFixed?.(1)}°
      </div>
      <div
        className="absolute bottom-0 translate-y-full left-1/2 -translate-x-1/2 text-green-500"
        style={{ textShadow: '0 0 2px #000' }}
      >
        ϕ {uavRoll?.toFixed?.(1)}°
      </div>
    </div>
  )
})

Compass.displayName = 'Compass'

export default Compass
