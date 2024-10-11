import IconDown from '@/assets/icons/jsx/IconDown'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconRight from '@/assets/icons/jsx/IconRight'
import IconUp from '@/assets/icons/jsx/IconUp'
import IconTurnLeft from '@/assets/icons/jsx/uav/IconTurnLeft'
import IconTurnRight from '@/assets/icons/jsx/uav/IconTurnRight'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'
import GimbalPitchBar from './GimbalPitchBar'
import Compass from './Compass'
import AvoidDistanceBar from './AvoidDistanceBar'
import IconUpStraight from '@/assets/icons/jsx/IconUpStraight'
import IconDownStraight from '@/assets/icons/jsx/IconDownStraight'
import GimbalService from './GimbalService'
import { Btn } from './type'
import { Tooltip } from 'antd'
import { useKeyDownGroup } from '@/hooks/useKeyDownGroup'

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
    return displayMode.includes('指点飞行') || displayMode.includes('一键起飞')
  }, [displayMode])

  const flySpeed = useUavControlRoomStore((s) => s.flyParams.flySpeed)

  const buttons = useRef<Btn[] | null>(null)
  if (!buttons.current) {
    buttons.current = [
      {
        value: { yaw: -15 },
        btn: 'Q',
        identifier: 'yaw',
        icon: <IconTurnLeft />,
        method: 'service.moveUav.post',
        label: '无人机左转',
      },
      {
        value: { y: 15 },
        btn: 'W',
        identifier: 'y',
        icon: <IconUp />,
        method: 'service.moveUav.post',
        label: '无人机前进',
      },
      {
        value: { yaw: 15 },
        btn: 'E',
        identifier: 'yaw',
        icon: <IconTurnRight />,
        method: 'service.moveUav.post',
        label: '无人机右转',
      },
      {
        value: { x: -15 },
        btn: 'A',
        identifier: 'x',
        icon: <IconLeft />,
        method: 'service.moveUav.post',
        label: '无人机左移',
      },
      {
        value: { y: -15 },
        btn: 'S',
        identifier: 'y',
        icon: <IconDown />,
        method: 'service.moveUav.post',
        label: '无人机后退',
      },
      {
        value: { x: 15 },
        btn: 'D',
        identifier: 'x',
        icon: <IconRight />,
        method: 'service.moveUav.post',
        label: '无人机右移',
      },
      {
        value: { z: 8 },
        btn: 'C',
        identifier: 'z',
        icon: <IconUpStraight />,
        method: 'service.moveUav.post',
        label: '无人机上升',
      },
      {
        value: { z: -5 },
        btn: 'Z',
        identifier: 'z',
        icon: <IconDownStraight />,
        method: 'service.moveUav.post',
        label: '无人机下降',
      },
    ]
  }

  const gimbalButtons = useRef<Btn[] | null>(null)
  if (!gimbalButtons.current) {
    gimbalButtons.current = [
      {
        btn: 'arrowup',
        identifier: 'pitch',
        icon: <IconUp />,
        value: { pitch: 15 },
        method: 'service.moveGimbal.post',
        label: '云台上仰',
      },
      {
        btn: 'arrowdown',
        icon: <IconDown />,
        identifier: 'pitch',
        value: { pitch: -15 },
        method: 'service.moveGimbal.post',
        label: '云台下俯',
      },
      {
        btn: 'arrowleft',
        identifier: 'yaw',
        icon: <IconLeft />,
        value: { yaw: -15 },
        method: 'service.moveGimbal.post',
        label: '云台左转',
      },
      {
        btn: 'arrowright',
        identifier: 'yaw',
        icon: <IconRight />,
        value: { yaw: 15 },
        method: 'service.moveGimbal.post',
        label: '云台右转',
      },
    ]
  }

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

  const keyMap = useRef<Record<string, Btn> | null>(null)
  if (!keyMap.current) {
    keyMap.current = Object.fromEntries([
      ...buttons.current.map((e) => [e.btn.toLowerCase(), e]),
      ...gimbalButtons.current.map((e) => [e.btn.toLowerCase(), e]),
    ])
  }

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
      const btn = keyMap.current![key]
      if (btn.method === 'service.moveUav.post') {
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
    <div
      className={clsx(
        'flex items-center select-none',
        // 因为右侧的按钮少, 为了保证方向盘在中间, 所以向左偏移一丢丢
        '-translate-x-2',
      )}
    >
      {/* 左 */}
      <div className="flex flex-col gap-1">
        <div className="border border-solid rounded bg-ground-100 border-ground-300 flex overflow-hidden">
          {buttons.current.slice(0, 3).map((e) => (
            <Tooltip key={e.btn} title={e.label} placement="top">
              <button
                disabled={!hasControlPower || isLimitedFly}
                className={clsx(
                  'flex flex-col gap-1 items-center p-1 px-2 hover:bg-primary hover:text-white',
                  'disabled:opacity-50 disabled:hover:bg-ground-100 disabled:cursor-not-allowed',
                  {
                    'bg-primary text-white':
                      uavControlInfo[e.identifier] * e.value[e.identifier]! > 0,
                  },
                )}
                onMouseDown={() => updateActiveMouseBtn(e)}
                onMouseLeave={handleUp}
                onMouseUp={handleUp}
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
        <div className="border border-solid rounded bg-ground-100 border-ground-300 flex overflow-hidden">
          {buttons.current.slice(3, 6).map((e) => (
            <Tooltip key={e.btn} title={e.label} placement="top">
              <button
                disabled={!hasControlPower || isLimitedFly}
                className={clsx(
                  'flex flex-col gap-1 items-center p-1 px-2 hover:bg-primary hover:text-white',
                  'disabled:opacity-50 disabled:hover:bg-ground-100 disabled:cursor-not-allowed',
                  {
                    'bg-primary text-white':
                      uavControlInfo[e.identifier] * e.value[e.identifier]! > 0,
                  },
                )}
                onMouseDown={() => updateActiveMouseBtn(e)}
                onMouseLeave={handleUp}
                onMouseUp={handleUp}
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
      <div className="absolute top-0 left-1/2 translate-x-[50px]">
        <GimbalService />
      </div>
      {/* 避障 */}
      <div className="w-10 flex flex-col items-center justify-center gap-3">
        <AvoidDistanceBar />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-3">
          <Tooltip title="无人机上升" placement="top">
            <div className="border border-solid rounded bg-ground-100 border-ground-300 flex overflow-hidden">
              <button
                disabled={!hasControlPower || isLimitedFly}
                className={clsx(
                  'flex flex-col gap-1 items-center p-1 px-2 hover:bg-primary hover:text-white',
                  'disabled:opacity-50 disabled:hover:bg-ground-100 disabled:cursor-not-allowed',
                  {
                    'bg-primary text-white':
                      uavControlInfo.z! * buttons.current[6].value.z! > 0,
                  },
                )}
                onMouseDown={() => updateActiveMouseBtn(buttons.current![6])}
                onMouseLeave={handleUp}
                onMouseUp={handleUp}
              >
                <IconUpStraight />C
              </button>
            </div>
          </Tooltip>
          <div className="border border-solid rounded bg-ground-100 border-ground-300 flex flex-col overflow-hidden">
            {gimbalButtons.current.slice(0, 2).map((e) => (
              <Tooltip key={e.btn} title={e.label} placement="top">
                <button
                  disabled={!isGimbalSource}
                  className={clsx(
                    'flex-1 px-2 hover:bg-primary hover:text-white',
                    'disabled:opacity-50 disabled:hover:bg-ground-100 disabled:cursor-not-allowed',
                    {
                      'bg-primary text-white':
                        gimbalControlInfo[e.identifier] *
                          e.value[e.identifier]! >
                        0,
                    },
                  )}
                  onMouseDown={() => updateActiveMouseBtn(e)}
                  onMouseLeave={handleUp}
                  onMouseUp={handleUp}
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
            AGL
            <br />m
          </span>
        </div>
        <div className="flex gap-3">
          <Tooltip title="无人机下降" placement="top">
            <div className="border border-solid rounded bg-ground-100 border-ground-300 flex overflow-hidden">
              <button
                disabled={!hasControlPower || isLimitedFly}
                className={clsx(
                  'flex flex-col gap-1 items-center p-1 px-2 hover:bg-primary hover:text-white',
                  'disabled:opacity-50 disabled:hover:bg-ground-100 disabled:cursor-not-allowed',
                  {
                    'bg-primary text-white':
                      uavControlInfo.z! * buttons.current[7].value.z! > 0,
                  },
                )}
                onMouseDown={() => updateActiveMouseBtn(buttons.current![7])}
                onMouseLeave={handleUp}
                onMouseUp={handleUp}
              >
                Z<IconDownStraight />
              </button>
            </div>
          </Tooltip>
          <div className="border border-solid rounded bg-ground-100 border-ground-300 flex flex-col overflow-hidden">
            {gimbalButtons.current.slice(2, 4).map((e) => (
              <Tooltip key={e.btn} title={e.label} placement="top">
                <button
                  disabled={!isGimbalSource}
                  className={clsx(
                    'flex-1 px-2 hover:bg-primary hover:text-white',
                    'disabled:opacity-50 disabled:hover:bg-ground-100 disabled:cursor-not-allowed',
                    {
                      'bg-primary text-white':
                        gimbalControlInfo[e.identifier] *
                          e.value[e.identifier]! >
                        0,
                    },
                  )}
                  onMouseDown={() => updateActiveMouseBtn(e)}
                  onMouseLeave={handleUp}
                  onMouseUp={handleUp}
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
