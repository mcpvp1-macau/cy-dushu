import compassRingImg from '@/assets/imgs/control/compass-ring.png'
import compassArrowImg from '@/assets/imgs/control/compass-arrow.svg'
import { Tooltip } from 'antd'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'

type PropsType = unknown

const Compass: FC<PropsType> = memo(() => {
  const yaw = useRebotDogControlRoomStore((s) => s.state.headingAngle ?? 0)

  const pitch = useRebotDogControlRoomStore((s) => s.state.positionPitch ?? 0)
  const roll = useRebotDogControlRoomStore((s) => s.state.positionRoll ?? 0)

  const { t } = useTranslation()

  return (
    <div className="w-32 h-32 relative pointer-events-none">
      {/* 姿态(横滚角) */}
      <div className="absolute inset-5 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 -left-80 -right-80 bg-gradient-to-b from-[#4c90f055] to-transparent"
          style={{
            top: `${((pitch + 90) / 180) * 100}%`,
            transformOrigin: 'top center',
            rotate: `${roll}deg`,
          }}
        />
      </div>
      {/* 指南针 */}
      <div className="absolute inset-0" style={{ rotate: `${-yaw}deg` }}>
        <img src={compassRingImg} className="absolute inset-0 top-[-1px]" />
      </div>
      {/*  */}
      <div className="abs-center">
        <img src={compassArrowImg} className="scale-90" />
      </div>
      <Tooltip
        className="pointer-events-auto"
        title={t('controlRoom.rebotDog.dogYaw.title')}
      >
        <div
          className="absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 text-green-500 whitespace-nowrap"
          style={{ textShadow: '0 0 2px #000' }}
        >
          ψ {yaw?.toFixed?.(1)}°
        </div>
      </Tooltip>
      <Tooltip
        className="pointer-events-auto"
        title={t('controlRoom.rebotDog.dogPitch.title')}
      >
        <div
          className="absolute bottom-0 translate-y-full left-0 text-green-500 whitespace-nowrap"
          style={{ textShadow: '0 0 2px #000' }}
        >
          θ {pitch?.toFixed?.(1)}°
        </div>
      </Tooltip>
      <Tooltip
        className="pointer-events-auto"
        title={t('controlRoom.rebotDog.dogRoll.title')}
      >
        <div
          className="absolute bottom-0 translate-y-full right-0 text-green-500 whitespace-nowrap"
          style={{ textShadow: '0 0 2px #000' }}
        >
          ϕ {roll?.toFixed?.(1)}°
        </div>
      </Tooltip>
    </div>
  )
})

Compass.displayName = 'Compass'

export default Compass
