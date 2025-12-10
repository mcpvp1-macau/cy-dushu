import compassArrowImg from '@/assets/imgs/control/compass-arrow.svg'
import compassRingImg from '@/assets/imgs/control/compass-ring.png'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'

const AttitudePanel: FC = memo(() => {
  const heading = useUsvControlRoomStore((s) => s.state.heading) ?? 0
  const pitch = useUsvControlRoomStore((s) => s.state.pitch) ?? 0
  const roll = useUsvControlRoomStore((s) => s.state.roll) ?? 0

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-40 w-40 pointer-events-none">
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

        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full whitespace-nowrap text-green-500"
          style={{ textShadow: '0 0 2px #000' }}
        >
          艏向 ψ {heading.toFixed(1)}°
        </div>
        <div
          className="absolute bottom-0 left-0 translate-y-full whitespace-nowrap text-green-500"
          style={{ textShadow: '0 0 2px #000' }}
        >
          纵摇 θ {pitch.toFixed(1)}°
        </div>
        <div
          className="absolute bottom-0 right-0 translate-y-full whitespace-nowrap text-green-500"
          style={{ textShadow: '0 0 2px #000' }}
        >
          横摇 ϕ {roll.toFixed(1)}°
        </div>
      </div>
    </div>
  )
})

AttitudePanel.displayName = 'AttitudePanel'

export default AttitudePanel
