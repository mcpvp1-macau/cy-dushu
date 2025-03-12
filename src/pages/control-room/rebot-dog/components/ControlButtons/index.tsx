import IconTurnLeft from '@/assets/icons/jsx/uav/IconTurnLeft'
import { Btn } from './type'
import IconUp from '@/assets/icons/jsx/IconUp'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconTurnRight from '@/assets/icons/jsx/uav/IconTurnRight'
import IconDown from '@/assets/icons/jsx/IconDown'
import IconRight from '@/assets/icons/jsx/IconRight'
import IconUpStraight from '@/assets/icons/jsx/IconUpStraight'
import IconDownStraight from '@/assets/icons/jsx/IconDownStraight'
import { Tooltip } from 'antd'
import Compass from './Compass'
import { useKeyDownGroup } from '@/hooks/useKeyDownGroup'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { ButtonHTMLAttributes } from 'react'
import ActionService from './ActionService'
const keyFilter = ['q', 'w', 'e', 'a', 's', 'd', 'u', 'i', 'o', 'j', 'k', 'l']

const RebotDogControlButtons: FC = memo(() => {
  const buttons = useMemo(
    () =>
      [
        {
          value: { yawSpeed: 0.1 },
          btn: 'Q',
          identifier: 'yawSpeed',
          icon: <IconTurnLeft />,
          method: 'service.moveDog.post',
          label: '左转',
        },
        {
          value: { xSpeed: 0.1 },
          btn: 'W',
          identifier: 'xSpeed',
          icon: <IconUp />,
          method: 'service.moveDog.post',
          label: '前进',
        },
        {
          value: { yawSpeed: -0.1 },
          btn: 'E',
          identifier: 'yawSpeed',
          icon: <IconTurnRight />,
          method: 'service.moveDog.post',
          label: '右转',
        },
        {
          value: { ySpeed: -0.1 },
          btn: 'A',
          identifier: 'ySpeed',
          icon: <IconLeft />,
          method: 'service.moveDog.post',
          label: '左移',
        },
        {
          value: { xSpeed: -0.1 },
          btn: 'S',
          identifier: 'xSpeed',
          icon: <IconDown />,
          method: 'service.moveDog.post',
          label: '后退',
        },
        {
          value: { ySpeed: 0.1 },
          btn: 'D',
          identifier: 'ySpeed',
          icon: <IconRight />,
          method: 'service.moveDog.post',
          label: '右移',
        },
        {
          value: { yaw: 0.1 },
          btn: 'U',
          identifier: 'yaw',
          icon: <IconTurnLeft />,
          method: 'service.moveDog.post',
          label: '左转头',
        },
        {
          value: { pitch: -0.1 },
          btn: 'I',
          identifier: 'pitch',
          icon: <IconUpStraight />,
          method: 'service.moveDog.post',
          label: '抬头',
        },
        {
          value: { yaw: -0.1 },
          btn: 'O',
          identifier: 'yaw',
          icon: <IconTurnLeft />,
          method: 'service.moveDog.post',
          label: '右转头',
        },
        {
          value: { roll: 0.1 },
          btn: 'J',
          identifier: 'roll',
          icon: <IconTurnRight />,
          method: 'service.moveDog.post',
          label: '左歪头',
        },
        {
          value: { pitch: 0.1 },
          btn: 'K',
          identifier: 'pitch',
          icon: <IconDownStraight />,
          method: 'service.moveDog.post',
          label: '低头',
        },
        {
          value: { roll: -0.1 },
          btn: 'L',
          identifier: 'roll',
          icon: <IconTurnLeft />,
          method: 'service.moveDog.post',
          label: '右歪头',
        },
      ] as Btn[],
    [],
  )

  const dogControlInfo = useRebotDogControlRoomStore((s) => s.dogControlInfo)
  const updateDogControlInfo = useRebotDogControlRoomStore(
    (s) => s.updateDogControlInfo,
  )
  const updateActiveMouseBtn = useRebotDogControlRoomStore(
    (s) => s.updateActiveMouseBtn,
  )
  const handleUp = useMemoizedFn(() => {
    updateActiveMouseBtn(null)
  })

  const keyMap = useMemo(
    () => Object.fromEntries(buttons.map((e) => [e.btn.toLowerCase(), e])),
    [buttons],
  )

  const activeBtns = useKeyDownGroup({
    keyFilter: keyFilter,
    clearOnOtherKey: true,
  })

  // 处理通过键盘按下的飞行控制指令
  useEffect(() => {
    const moveDogRes = {
      xSpeed: 0,
      ySpeed: 0,
      yawSpeed: 0,
      yaw: 0,
      pitch: 0,
      roll: 0,
    }

    activeBtns.forEach((e) => {
      const btn = keyMap[e]
      if (btn.method === 'service.moveDog.post') {
        moveDogRes[btn.identifier] += btn.value[btn.identifier] ?? 0
      }
    })

    updateDogControlInfo(moveDogRes)
  }, [activeBtns.size])

  return (
    <div
      className={clsx('flex items-center select-none font-[Consolas] gap-3')}
    >
      {/* 左 */}
      <div className="flex flex-col gap-1">
        <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
          {buttons.slice(0, 3).map((e) => (
            <Tooltip key={e.btn} title={e.label} placement="top">
              <ControlButton
                active={
                  (dogControlInfo[e.identifier] ?? 0) * e.value[e.identifier]! >
                  0
                }
                onMouseDown={() => updateActiveMouseBtn(e)}
                onMouseUp={handleUp}
                onMouseLeave={handleUp}
              >
                {e.icon}
                {e.btn}
              </ControlButton>
            </Tooltip>
          ))}
        </div>
        <div className="flex justify-center gap-2 items-center text-green-500 text-shadow pointer-events-none">
          <span className="text-sm">
            SPD
            <br />
            m/s
          </span>
          <span className="text-lg">{0}</span>
        </div>
        <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
          {buttons.slice(3, 6).map((e) => (
            <Tooltip key={e.btn} title={e.label} placement="top">
              <ControlButton
                active={
                  (dogControlInfo[e.identifier] ?? 0) * e.value[e.identifier]! >
                  0
                }
                onMouseDown={() => updateActiveMouseBtn(e)}
                onMouseUp={handleUp}
                onMouseLeave={handleUp}
              >
                {e.btn}
                {e.icon}
              </ControlButton>
            </Tooltip>
          ))}
        </div>
      </div>
      {/* 中 */}
      <div className="relative">
        <Compass />
        <div className="absolute -top-6 left-0">
          <ActionService />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
          {buttons.slice(6, 9).map((e) => (
            <Tooltip key={e.btn} title={e.label} placement="top">
              <ControlButton
                active={
                  (dogControlInfo[e.identifier] ?? 0) * e.value[e.identifier]! >
                  0
                }
                onMouseDown={() => updateActiveMouseBtn(e)}
                onMouseUp={handleUp}
                onMouseLeave={handleUp}
              >
                {e.icon}
                {e.btn}
              </ControlButton>
            </Tooltip>
          ))}
        </div>
        <div className="flex justify-center gap-2 items-center text-green-500 text-shadow pointer-events-none">
          <span className="text-lg">{'-'}</span>
          <span className="text-sm">
            ALT
            <br />m
          </span>
        </div>
        <div className="flex gap-3">
          <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
            {buttons.slice(9, 12).map((e) => (
              <Tooltip key={e.btn} title={e.label} placement="top">
                <ControlButton
                  active={
                    (dogControlInfo[e.identifier] ?? 0) *
                      e.value[e.identifier]! >
                    0
                  }
                  onMouseDown={() => updateActiveMouseBtn(e)}
                  onMouseUp={handleUp}
                  onMouseLeave={handleUp}
                >
                  {e.btn}
                  {e.icon}
                </ControlButton>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

RebotDogControlButtons.displayName = 'ControlButtons'

export default RebotDogControlButtons

/** 控制按钮 */
const ControlButton: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean
  }
> = ({ active, ...props }) => {
  return (
    <button
      {...props}
      className={clsx(
        'flex flex-col gap-1 items-center p-1 px-2 hover:bg-primary hover:text-white',
        'disabled:opacity-50 disabled:hover:bg-ground-1 disabled:cursor-not-allowed',
        {
          'bg-primary text-white': active,
        },
      )}
    />
  )
}
