import { Button } from 'antd'
import controlBG from '@/assets/imgs/control/buttonBg.png'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import CircleButton from './CircleButton'
import { useRafInterval } from 'ahooks'

const controls1 = [
  ['前进', 'left-1/2 -translate-x-1/2', { y: 15 }],
  ['后退', 'left-1/2 bottom-0 -translate-x-1/2', { y: -15 }],
  ['左移', 'top-1/2 -translate-y-1/2', { x: -15 }],
  ['右移', 'top-1/2 right-0 -translate-y-1/2', { x: 15 }],
] as const

const controls2 = [
  ['上飞', 'left-1/2 -translate-x-1/2', { z: 5 }],
  ['下飞', 'left-1/2 bottom-0 -translate-x-1/2', { z: -5 }],
  ['左转', 'top-1/2 -translate-y-1/2', { yaw: -15 }],
  ['右转', 'top-1/2 right-0 -translate-y-1/2', { yaw: 15 }],
] as const

type PropsType = unknown

const UavDetailFlightControl: FC<PropsType> = memo(() => {
  const wsReadyState = useUavControlRoomStore((s) => s.wsReadyState)
  const controlTag = useUavControlRoomStore((s) => s.state.controlTag)

  const uuid = useUavControlRoomStore((s) => s.uuid)

  const [downKey, setDownKey] = useState<Record<string, number> | null>(null)

  const sendCommand = useUavControlRoomStore((s) => s.sendCommand)

  useRafInterval(
    () => {
      sendCommand('service.moveUav.post', downKey)
    },
    downKey ? 60 : undefined,
  )

  const canControl = uuid && controlTag === uuid && wsReadyState === 1

  return (
    <div className="p-3 flex items-center justify-between gap-3">
      <div className="flex flex-col gap-3 w-[90px]">
        <Button type="primary" block size="small" disabled={!canControl}>
          起飞
        </Button>
        <Button type="primary" block size="small" disabled={!canControl}>
          降落
        </Button>
        <Button type="primary" block size="small" disabled={!canControl}>
          返程
        </Button>
      </div>

      {/* 左边控制区 */}
      <div className="relative h-[100px] w-[100px]">
        <img className="size-full" src={controlBG} alt="" />
        <div className="absolute inset-1">
          {controls1.map(([title, className, payload]) => (
            <CircleButton
              key={title}
              className={className}
              disabled={!canControl}
              onMouseDown={() => setDownKey(payload)}
              onMouseUp={() => setDownKey(null)}
              onMouseLeave={() => setDownKey(null)}
            >
              {title}
            </CircleButton>
          ))}
        </div>
      </div>

      {/* 右边控制区 */}
      <div className="relative h-[100px] w-[100px]">
        <img className="size-full" src={controlBG} alt="" />
        <div className="absolute inset-1">
          {controls2.map(([title, className, payload]) => (
            <CircleButton
              key={title}
              className={className}
              disabled={!canControl}
              onMouseDown={() => setDownKey(payload)}
              onMouseUp={() => setDownKey(null)}
              onMouseLeave={() => setDownKey(null)}
            >
              {title}
            </CircleButton>
          ))}
        </div>
      </div>
    </div>
  )
})

UavDetailFlightControl.displayName = 'UavDetailFlightControl'

export default UavDetailFlightControl
