import { Button, Tooltip } from 'antd'
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
import usePostDeviceService from '@/pages/control-room/uav/hooks/usePostDeviceService'
import { useDeviceDetailStore } from '../../../hooks/useDeviceDetail.store'

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

  const controls1 = useMemo(
    () =>
      [
        [
          <IconUp />,
          'left-1/2 -translate-x-1/2',
          { y: 15 },
          t('controlRoom.control.uavForward.title'),
          'top',
        ],
        [
          <IconDown />,
          'left-1/2 bottom-0 -translate-x-1/2',
          { y: -15 },
          t('controlRoom.control.uavBack.title'),
          'bottom',
        ],
        [
          <IconLeft />,
          'top-1/2 -translate-y-1/2',
          { x: -15 },
          t('controlRoom.control.uavLeft.title'),
          'left',
        ],
        [
          <IconRight />,
          'top-1/2 right-0 -translate-y-1/2',
          { x: 15 },
          t('controlRoom.control.uavRight.title'),
          'right',
        ],
      ] as const,
    [t],
  )

  const controls2 = useMemo(
    () =>
      [
        [
          <IconUpStraight />,
          'left-1/2 -translate-x-1/2',
          { z: 5 },
          t('controlRoom.control.uavFlyUp.title'),
          'top',
        ],
        [
          <IconDownStraight />,
          'left-1/2 bottom-0 -translate-x-1/2',
          { z: -5 },
          t('controlRoom.control.uavFlyDown.title'),
          'bottom',
        ],
        [
          <IconTurnLeft />,
          'top-1/2 -translate-y-1/2',
          { yaw: -15 },
          t('controlRoom.control.uavTurnLeft.title'),
          'left',
        ],
        [
          <IconTurnRight />,
          'top-1/2 right-0 -translate-y-1/2',
          { yaw: 15 },
          t('controlRoom.control.uavTurnRight.title'),
          'right',
        ],
      ] as const,
    [t],
  )

  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const postService = usePostDeviceService()

  const leftBtns = useMemo(
    () => [
      ['takeoff', t('uav.takeOff.title')],
      ['autoland', t('uav.land.title')],
      ['gohome', t('uav.return.title')],
    ],
    [t],
  )

  return (
    <div className="p-3 flex items-center justify-between gap-3">
      <div className="flex flex-col gap-3 w-[90px]">
        {leftBtns.map(([service, label]) => (
          <Button
            key={service}
            type="primary"
            block
            size="small"
            disabled={!canControl || !serviceHave[service]}
            onClick={() => postService(service)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* 左边控制区 */}
      <div className="relative h-[100px] w-[100px]">
        <img className="size-full" src={controlBG} alt="" />
        <div className="absolute inset-1">
          {controls1.map(
            ([title, className, payload, tooltip, placement], i) => (
              <Tooltip key={i} title={tooltip} placement={placement}>
                <CircleButton
                  className={className}
                  disabled={!canControl}
                  onMouseDown={() => setDownKey(payload)}
                  onMouseUp={() => setDownKey(null)}
                  onMouseLeave={() => setDownKey(null)}
                >
                  {title}
                </CircleButton>
              </Tooltip>
            ),
          )}
        </div>
      </div>

      {/* 右边控制区 */}
      <div className="relative h-[100px] w-[100px]">
        <img className="size-full" src={controlBG} alt="" />
        <div className="absolute inset-1">
          {controls2.map(
            ([title, className, payload, tooltip, placement], i) => (
              <Tooltip key={i} title={tooltip} placement={placement}>
                <CircleButton
                  className={className}
                  disabled={!canControl}
                  onMouseDown={() => setDownKey(payload)}
                  onMouseUp={() => setDownKey(null)}
                  onMouseLeave={() => setDownKey(null)}
                >
                  {title}
                </CircleButton>
              </Tooltip>
            ),
          )}
        </div>
      </div>
    </div>
  )
})

UavDetailFlightControl.displayName = 'UavDetailFlightControl'

export default UavDetailFlightControl
