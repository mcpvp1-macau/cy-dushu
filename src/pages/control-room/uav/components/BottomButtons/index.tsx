import IconDown from '@/assets/icons/jsx/IconDown'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconRight from '@/assets/icons/jsx/IconRight'
import IconUp from '@/assets/icons/jsx/IconUp'
import IconTurnLeft from '@/assets/icons/jsx/uav/IconTurnLeft'
import IconTurnRight from '@/assets/icons/jsx/uav/IconTurnRight'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import GimbalPitchBar from './GimbalPitchBar'
import Compass from './Compass'
import AvoidDistanceBar from './AvoidDistanceBar'
import IconUpStraight from '@/assets/icons/jsx/IconUpStraight'
import IconDownStraight from '@/assets/icons/jsx/IconDownStraight'
import GimbalService from './GimbalService'
import { Btn } from './type'
import { Tooltip } from 'antd'
import { useKeyDownGroup } from '@/hooks/useKeyDownGroup'
import { useLatest } from 'ahooks'

type PropsType = unknown

/** 底部操作按钮 */
const BottomButtons: FC<PropsType> = memo(() => {
  const speed = useUavControlRoomStore((s) => s.state.horizontalSpeed)
  const height = useUavControlRoomStore((s) => s.state.height)
  const updateActiveMouseBtn = useUavControlRoomStore(
    (s) => s.updateActiveMouseBtn,
  )
  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)
  const displayMode = useUavControlRoomStore((s) => s.state.displayMode)
  const isLimitedFly = useMemo(() => {
    if (!displayMode) {
      return false
    }
    return (
      displayMode.startsWith('指点飞行') ||
      displayMode.startsWith('一键起飞') ||
      displayMode.startsWith('10000') // 10000 是 指点飞行
    )
  }, [displayMode])

  const flySpeed = useUavControlRoomStore((s) => s.flyParams.flySpeed)
  const { t } = useTranslation()
  const buttons = useMemo(
    () =>
      [
        {
          value: { yaw: -15 },
          btn: 'Q',
          identifier: 'yaw',
          icon: <IconTurnLeft />,
          method: 'service.moveUav.post',
          label: t('controlRoom.control.uavTurnLeft.title'),
        },
        {
          value: { y: 15 },
          btn: 'W',
          identifier: 'y',
          icon: <IconUp />,
          method: 'service.moveUav.post',
          label: t('controlRoom.control.uavForward.title'),
        },
        {
          value: { yaw: 15 },
          btn: 'E',
          identifier: 'yaw',
          icon: <IconTurnRight />,
          method: 'service.moveUav.post',
          label: t('controlRoom.control.uavTurnRight.title'),
        },
        {
          value: { x: -15 },
          btn: 'A',
          identifier: 'x',
          icon: <IconLeft />,
          method: 'service.moveUav.post',
          label: t('controlRoom.control.uavLeft.title'),
        },
        {
          value: { y: -15 },
          btn: 'S',
          identifier: 'y',
          icon: <IconDown />,
          method: 'service.moveUav.post',
          label: t('controlRoom.control.uavBack.title'),
        },
        {
          value: { x: 15 },
          btn: 'D',
          identifier: 'x',
          icon: <IconRight />,
          method: 'service.moveUav.post',
          label: t('controlRoom.control.uavRight.title'),
        },
        {
          value: { z: 5 },
          btn: 'C',
          identifier: 'z',
          icon: <IconUpStraight />,
          method: 'service.moveUav.post',
          label: t('controlRoom.control.uavFlyUp.title'),
        },
        {
          value: { z: -3 },
          btn: 'Z',
          identifier: 'z',
          icon: <IconDownStraight />,
          method: 'service.moveUav.post',
          label: t('controlRoom.control.uavFlyDown.title'),
        },
      ] as Btn[],
    [t],
  )

  const gimbalYawSpeed = useUavControlRoomStore(
    (s) => s.flyParams.gimbalYawSpeed ?? 10,
  )
  const gimbalPitchSpeed = useUavControlRoomStore(
    (s) => s.flyParams.gimbalPitchSpeed ?? 10,
  )

  const gimbalButtons = useMemo(
    () =>
      [
        {
          btn: 'arrowup',
          identifier: 'pitch',
          icon: <IconUp />,
          value: { pitch: gimbalPitchSpeed },
          method: 'service.moveGimbal.post',
          label: t('controlRoom.control.gimbalTiltUp.title'),
        },
        {
          btn: 'arrowdown',
          icon: <IconDown />,
          identifier: 'pitch',
          value: { pitch: -gimbalPitchSpeed },
          method: 'service.moveGimbal.post',
          label: t('controlRoom.control.gimbalTiltDown.title'),
        },
        {
          btn: 'arrowleft',
          identifier: 'yaw',
          icon: <IconLeft />,
          value: { yaw: -gimbalYawSpeed },
          method: 'service.moveGimbal.post',
          label: t('controlRoom.control.gimbalTurnLeft.title'),
        },
        {
          btn: 'arrowright',
          identifier: 'yaw',
          icon: <IconRight />,
          value: { yaw: gimbalYawSpeed },
          method: 'service.moveGimbal.post',
          label: t('controlRoom.control.gimbalTurnRight.title'),
        },
      ] as Btn[],
    [t, gimbalYawSpeed, gimbalPitchSpeed],
  )

  const handleUp = useMemoizedFn(() => {
    updateActiveMouseBtn(null)
  })

  const keyFilter = useRef<string[] | null>(null)
  if (!keyFilter.current) {
    keyFilter.current = [
      'q',
      'w',
      'e',
      'a',
      's',
      'd',
      'c',
      'z',
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright',
    ]
  }

  const keyMap = useMemo(() => {
    return Object.fromEntries([
      ...buttons.map((e) => [e.btn.toLowerCase(), e]),
      ...gimbalButtons.map((e) => [e.btn.toLowerCase(), e]),
    ])
  }, [buttons, gimbalButtons])
  const latestKeymap = useLatest(keyMap)

  const activeBtns = useKeyDownGroup({
    keyFilter: keyFilter.current,
    clearOnOtherKey: true,
  })
  const uavControlInfo = useUavControlRoomStore((s) => s.uavControlInfo)
  const gimbalControlInfo = useUavControlRoomStore((s) => s.gimbalControlInfo)
  const updateUavControlInfo = useUavControlRoomStore(
    (s) => s.updateUavControlInfo,
  )
  const updateGimbalControlInfo = useUavControlRoomStore(
    (s) => s.updateGimbalControlInfo,
  )

  // 处理通过键盘按下的飞行控制指令
  useEffect(() => {
    const uavRes = {
      x: 0,
      y: 0,
      z: 0,
      yaw: 0,
    }
    const gimbalRes = {
      pitch: 0,
      yaw: 0,
    }
    for (const key of activeBtns) {
      const btn = latestKeymap.current![key]
      if (btn.method === 'service.moveUav.post') {
        // 不能控制飞行
        if (!hasControlPower || isLimitedFly) {
          continue
        }
        uavRes[btn.identifier] +=
          (btn.value[btn.identifier] ?? 0) * (flySpeed / 15)
      } else {
        gimbalRes[btn.identifier] += btn.value[btn.identifier]
      }
    }
    updateUavControlInfo(uavRes)
    updateGimbalControlInfo(gimbalRes)
  }, [activeBtns.size])

  const isGimbalSource =
    useUavControlRoomStore((s) => s.state.videoSource) === 'gimbal'

  return (
    <div className={clsx('flex items-center select-none font-[Consolas]')}>
      {/* 左 */}
      <div className="flex flex-col gap-1">
        <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
          {buttons.slice(0, 3).map((e) => (
            <Tooltip key={e.btn} title={e.label} placement="top">
              <button
                disabled={!hasControlPower || isLimitedFly}
                className={clsx(
                  'flex flex-col gap-1 items-center p-1 px-2 hover:bg-primary hover:text-white',
                  'disabled:opacity-50 disabled:hover:bg-ground-1 disabled:cursor-not-allowed',
                  {
                    'bg-primary text-white':
                      uavControlInfo[e.identifier] * e.value[e.identifier]! > 0,
                  },
                )}
                onMouseDown={() => updateActiveMouseBtn(e)}
                onTouchStart={() => updateActiveMouseBtn(e)}
                onMouseLeave={handleUp}
                onMouseUp={handleUp}
                onTouchEnd={handleUp}
                onTouchCancel={handleUp}
              >
                {e.icon}
                {e.btn}
              </button>
            </Tooltip>
          ))}
        </div>
        <div className="flex justify-center gap-2 items-center text-green-500 text-shadow pointer-events-none">
          <span className="text-sm">
            SPD
            <br />
            m/s
          </span>
          <span className="text-lg">{speed?.toFixed?.(1)}</span>
        </div>
        <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
          {buttons.slice(3, 6).map((e) => (
            <Tooltip key={e.btn} title={e.label} placement="top">
              <button
                disabled={!hasControlPower || isLimitedFly}
                className={clsx(
                  'flex flex-col gap-1 items-center p-1 px-2 hover:bg-primary hover:text-white',
                  'disabled:opacity-50 disabled:hover:bg-ground-1 disabled:cursor-not-allowed',
                  {
                    'bg-primary text-white':
                      uavControlInfo[e.identifier] * e.value[e.identifier]! > 0,
                  },
                )}
                onMouseDown={() => updateActiveMouseBtn(e)}
                onTouchStart={() => updateActiveMouseBtn(e)}
                onMouseLeave={handleUp}
                onMouseUp={handleUp}
                onTouchEnd={handleUp}
                onTouchCancel={handleUp}
              >
                {e.btn}
                {e.icon}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
      {/* 云台俯仰角 */}
      <div className="w-10 flex flex-col items-center justify-center gap-3">
        <GimbalPitchBar />
      </div>
      {/* 中 */}
      <div className="relative">
        <Compass />
      </div>
      {/* 避障 */}
      <div className="absolute top-1/2 translate-y-[-80px] left-1/2 translate-x-[50px]">
        <GimbalService />
      </div>
      {/* 避障 */}
      <div className="w-10 flex flex-col items-center justify-center gap-3">
        <AvoidDistanceBar />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-3">
          <Tooltip title={buttons[6].label} placement="top">
            <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
              <button
                disabled={!hasControlPower || isLimitedFly}
                className={clsx(
                  'flex flex-col gap-1 items-center p-1 px-2 hover:bg-primary hover:text-white',
                  'disabled:opacity-50 disabled:hover:bg-ground-1 disabled:cursor-not-allowed',
                  {
                    'bg-primary text-white':
                      uavControlInfo.z! * buttons[6].value.z! > 0,
                  },
                )}
                onMouseDown={() => updateActiveMouseBtn(buttons[6])}
                onTouchStart={() => updateActiveMouseBtn(buttons[6])}
                onMouseLeave={handleUp}
                onMouseUp={handleUp}
                onTouchEnd={handleUp}
                onTouchCancel={handleUp}
              >
                <IconUpStraight />C
              </button>
            </div>
          </Tooltip>
          <div className="border border-solid rounded bg-ground-1 border-ground-5 flex flex-col overflow-hidden">
            {gimbalButtons.slice(0, 2).map((e) => (
              <Tooltip key={e.btn} title={e.label} placement="top">
                <button
                  disabled={!isGimbalSource}
                  className={clsx(
                    'flex-1 px-2 hover:bg-primary hover:text-white',
                    'disabled:opacity-50 disabled:hover:bg-ground-1 disabled:cursor-not-allowed',
                    {
                      'bg-primary text-white':
                        gimbalControlInfo[e.identifier] *
                          e.value[e.identifier]! >
                        0,
                    },
                  )}
                  onMouseDown={() => updateActiveMouseBtn(e)}
                  onTouchStart={() => updateActiveMouseBtn(e)}
                  onMouseLeave={handleUp}
                  onMouseUp={handleUp}
                  onTouchEnd={handleUp}
                >
                  {e.icon}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-2 items-center text-green-500 text-shadow pointer-events-none">
          <span className="text-lg">{height?.toFixed?.(1)}</span>
          <span className="text-sm">
            ALT
            <br />m
          </span>
        </div>
        <div className="flex gap-3">
          <Tooltip title={buttons[7].label} placement="top">
            <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
              <button
                disabled={!hasControlPower || isLimitedFly}
                className={clsx(
                  'flex flex-col gap-1 items-center p-1 px-2 hover:bg-primary hover:text-white',
                  'disabled:opacity-50 disabled:hover:bg-ground-1 disabled:cursor-not-allowed',
                  {
                    'bg-primary text-white':
                      uavControlInfo.z! * buttons[7].value.z! > 0,
                  },
                )}
                onMouseDown={() => updateActiveMouseBtn(buttons[7])}
                onTouchStart={() => updateActiveMouseBtn(buttons[7])}
                onMouseLeave={handleUp}
                onMouseUp={handleUp}
                onTouchEnd={handleUp}
                onTouchCancel={handleUp}
              >
                Z<IconDownStraight />
              </button>
            </div>
          </Tooltip>
          <div className="border border-solid rounded bg-ground-1 border-ground-5 flex flex-col overflow-hidden">
            {gimbalButtons.slice(2, 4).map((e) => (
              <Tooltip key={e.btn} title={e.label} placement="top">
                <button
                  disabled={!isGimbalSource}
                  className={clsx(
                    'flex-1 px-2 hover:bg-primary hover:text-white',
                    'disabled:opacity-50 disabled:hover:bg-ground-1 disabled:cursor-not-allowed',
                    {
                      'bg-primary text-white':
                        gimbalControlInfo[e.identifier] *
                          e.value[e.identifier]! >
                        0,
                    },
                  )}
                  onMouseDown={() => updateActiveMouseBtn(e)}
                  onTouchStart={() => updateActiveMouseBtn(e)}
                  onMouseLeave={handleUp}
                  onMouseUp={handleUp}
                  onTouchEnd={handleUp}
                  onTouchCancel={handleUp}
                >
                  {e.icon}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

BottomButtons.displayName = 'BottomButtons'

export default BottomButtons
