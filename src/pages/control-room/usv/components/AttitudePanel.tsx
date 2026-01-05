import compassArrowImg from '@/assets/imgs/control/compass-arrow.svg'
import compassRingImg from '@/assets/imgs/control/compass-ring.png'
import LiqunTippy from '@/components/ui/LiqunTippy'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'

const AttitudePanel: FC = memo(() => {
  const heading = useUsvControlRoomStore((s) => s.state.heading) ?? 0
  const pitch = useUsvControlRoomStore((s) => s.state.pitch) ?? 0
  const roll = useUsvControlRoomStore((s) => s.state.roll) ?? 0
  const speed = useUsvControlRoomStore((s) => s.state.speed) ?? 0
  const course = useUsvControlRoomStore((s) => s.state.course) ?? 0

  const { t } = useTranslation()

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative size-32 min-w-32">
        <div className="absolute inset-5 overflow-hidden rounded-full">
          <div
            className="absolute inset-0 -left-80 -right-80 bg-gradient-to-b from-[#4c90f055] to-transparent"
            style={{
              top: `${((pitch + 90) / 180) * 100}%`,
              transformOrigin: 'top center',
              rotate: `${roll}deg`,
            }}
          />
        </div>

        <div className="absolute inset-0" style={{ rotate: `${-heading}deg` }}>
          <img src={compassRingImg} className="absolute inset-0 top-[-1px]" />
        </div>

        <div className="abs-center">
          <img src={compassArrowImg} className="scale-90" />
        </div>

        <LiqunTippy content={t('usv.attitude.heading', '艏向')}>
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full whitespace-nowrap text-green-500"
            style={{ textShadow: '0 0 2px #000' }}
          >
            ψ {heading.toFixed(1)}°
          </div>
        </LiqunTippy>
        <LiqunTippy
          className="pointer-events-auto"
          content={t('usv.attitude.pitch', '纵摇')}
        >
          <div
            className="absolute bottom-0 left-0 translate-y-full whitespace-nowrap text-green-500 select-none"
            style={{ textShadow: '0 0 2px #000' }}
          >
            θ {pitch.toFixed(1)}°
          </div>
        </LiqunTippy>
        <LiqunTippy
          className="pointer-events-auto"
          content={t('usv.attitude.roll', '横摇')}
        >
          <div
            className="absolute bottom-0 right-0 translate-y-full whitespace-nowrap text-green-500 select-none"
            style={{ textShadow: '0 0 2px #000' }}
          >
            ϕ {roll.toFixed(1)}°
          </div>
        </LiqunTippy>

        <LiqunTippy
          className="pointer-events-auto"
          content={t('common.speed', '速度')}
        >
          <div
            className="absolute -left-2 -translate-x-full flex items-center gap-1 top-1/2 -translate-y-1/2 whitespace-nowrap text-green-500 select-none"
            style={{ textShadow: '0 0 2px #000' }}
          >
            <div className="flex flex-col text-xs">
              <span>SPD</span>
              <span>m/s</span>
            </div>
            <div>{speed.toFixed(1)}</div>
          </div>
        </LiqunTippy>

        <LiqunTippy className="pointer-events-auto" content={'航向'}>
          <div
            className="absolute -right-2 translate-x-full flex items-center gap-1 top-1/2 -translate-y-1/2 whitespace-nowrap text-green-500 select-none"
            style={{ textShadow: '0 0 2px #000' }}
          >
            <div>{course.toFixed(1)}</div>
            <div className="flex flex-col text-xs">
              <span>HDG</span>
              <span>deg</span>
            </div>
          </div>
        </LiqunTippy>
      </div>
    </div>
  )
})

AttitudePanel.displayName = 'AttitudePanel'

export default AttitudePanel
