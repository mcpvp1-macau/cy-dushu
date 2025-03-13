import compassRingImg from '@/assets/imgs/control/compass-ring.png'
import compassArrowImg from '@/assets/imgs/control/compass-arrow.svg'
import { Tooltip } from 'antd'

type PropsType = unknown

const Compass: FC<PropsType> = memo(() => {
  const uavYaw = 0

  const uavRoll = 0
  const uavPitch = 0

  const { t } = useTranslation()

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
      </div>
      {/*  */}
      <div className="abs-center">
        <img src={compassArrowImg} className="scale-90" />
      </div>
      <Tooltip
        className="pointer-events-auto"
        title={t('controlRoom.uav.uavYaw.title')}
      >
        <div
          className="absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 text-green-500 whitespace-nowrap"
          style={{ textShadow: '0 0 2px #000' }}
        >
          ψ {uavYaw?.toFixed?.(1)}°
        </div>
      </Tooltip>
      <Tooltip
        className="pointer-events-auto"
        title={t('controlRoom.uav.uavPitch.title')}
      >
        <div
          className="absolute bottom-0 translate-y-full left-0 text-green-500 whitespace-nowrap"
          style={{ textShadow: '0 0 2px #000' }}
        >
          θ {uavPitch?.toFixed?.(1)}°
        </div>
      </Tooltip>
      <Tooltip
        className="pointer-events-auto"
        title={t('controlRoom.uav.uavRoll.title')}
      >
        <div
          className="absolute bottom-0 translate-y-full right-0 text-green-500 whitespace-nowrap"
          style={{ textShadow: '0 0 2px #000' }}
        >
          ϕ {uavRoll?.toFixed?.(1)}°
        </div>
      </Tooltip>
    </div>
  )
})

Compass.displayName = 'Compass'

export default Compass
