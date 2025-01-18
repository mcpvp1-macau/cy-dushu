import React from 'react'
import controlBG from '@/assets/imgs/control/buttonBg.png'
import CircleButton from '../../../UavDetail/components/UavControlPanel/CircleButton'
import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'

type PropsType = {
  speed: number
  setDownKey: (key: any) => void
}

const ControlBar: React.FC<PropsType> = ({ speed, setDownKey }) => {
  const controls1 = [
    ['上', 'left-1/2 -translate-x-1/2', { yaw: 0, pitch: speed }],
    ['下', 'left-1/2 bottom-0 -translate-x-1/2', { yaw: 0, pitch: -speed }],
    ['左', 'top-1/2 -translate-y-1/2', { yaw: -speed, pitch: 0 }],
    ['右', 'top-1/2 right-0 -translate-y-1/2', { yaw: speed, pitch: 0 }],
  ] as const
  const disable = false // useOthersControlRoomStore((s) => !s.hasControlPower)
  return (
    <div className="relative h-[100px] w-[100px] select-none">
      <img className="size-full" src={controlBG} alt="" />
      <div className="absolute inset-1">
        {controls1.map(([title, className, payload]) => (
          <CircleButton
            key={title}
            className={className}
            disabled={disable}
            onMouseDown={() => {
              setDownKey(payload)
            }}
            onMouseUp={() => {
              setDownKey(null)
            }}
            onMouseLeave={() => {
              setDownKey(null)
            }}
          >
            {title}
          </CircleButton>
        ))}
      </div>
    </div>
  )
}

export default React.memo(ControlBar)
