import { Button } from 'antd'
import controlBG from '@/assets/imgs/control/buttonBg.png'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import CircleButton from './CircleButton'
import { useRafInterval } from 'ahooks'
import IconUp from '@/assets/icons/jsx/IconUp'
import IconDown from '@/assets/icons/jsx/IconDown'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconRight from '@/assets/icons/jsx/IconRight'
import IconTurnLeft from '@/assets/icons/jsx/uav/IconTurnLeft'
import IconTurnRight from '@/assets/icons/jsx/uav/IconTurnRight'
import IconDownStraight from '@/assets/icons/jsx/IconDownStraight'
import IconUpStraight from '@/assets/icons/jsx/IconUpStraight'

const controls1 = [
  [<IconUp />, 'left-1/2 -translate-x-1/2', { y: 15 }],
  [<IconDown />, 'left-1/2 bottom-0 -translate-x-1/2', { y: -15 }],
  [<IconLeft />, 'top-1/2 -translate-y-1/2', { x: -15 }],
  [<IconRight />, 'top-1/2 right-0 -translate-y-1/2', { x: 15 }],
] as const

const controls2 = [
  [<IconUpStraight />, 'left-1/2 -translate-x-1/2', { z: 5 }],
  [<IconDownStraight />, 'left-1/2 bottom-0 -translate-x-1/2', { z: -5 }],
  [<IconTurnLeft />, 'top-1/2 -translate-y-1/2', { yaw: -15 }],
  [<IconTurnRight />, 'top-1/2 right-0 -translate-y-1/2', { yaw: 15 }],
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

  const { t } = useTranslation()

  return (
    <div className="p-3 flex items-center justify-between gap-3">
      <div className="flex flex-col gap-3 w-[90px]">
        <Button type="primary" block size="small" disabled={!canControl}>
          {t('uav.takeOff.title')}
        </Button>
        <Button type="primary" block size="small" disabled={!canControl}>
          {t('uav.land.title')}
        </Button>
        <Button type="primary" block size="small" disabled={!canControl}>
          {t('uav.return.title')}
        </Button>
      </div>

      {/* 左边控制区 */}
      <div className="relative h-[100px] w-[100px]">
        <img className="size-full" src={controlBG} alt="" />
        <div className="absolute inset-1">
          {controls1.map(([title, className, payload], i) => (
            <CircleButton
              key={i}
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
          {controls2.map(([title, className, payload], i) => (
            <CircleButton
              key={i}
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
