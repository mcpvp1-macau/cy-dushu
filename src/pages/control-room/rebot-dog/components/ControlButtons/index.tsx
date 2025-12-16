import IconTurnLeft from '@/assets/icons/jsx/uav/IconTurnLeft'
import { Btn } from './type'
import IconUp from '@/assets/icons/jsx/IconUp'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconTurnRight from '@/assets/icons/jsx/uav/IconTurnRight'
import IconDown from '@/assets/icons/jsx/IconDown'
import IconRight from '@/assets/icons/jsx/IconRight'
import { Tooltip } from 'antd'
import Compass from './Compass'
import { useKeyDownGroup } from '@/hooks/useKeyDownGroup'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { ButtonHTMLAttributes } from 'react'
import ActionService from './ActionService'
import IconTurnRight2 from '@/assets/icons/jsx/IconTurnRight2'
import IconTurnDown from '@/assets/icons/jsx/IconTurnDown'
import IconTurnLeft2 from '@/assets/icons/jsx/IconTurnLeft2'
import IconTurnOn from '@/assets/icons/jsx/IconTurnOn'
import { useTranslation } from 'react-i18next'

import IconTurnLeft3 from '@/assets/icons/jsx/IconTurnLeft'
import IconTurnRight3 from '@/assets/icons/jsx/IconTurnRight'

const keyFilter = ['q', 'w', 'e', 'a', 's', 'd', 'u', 'i', 'o', 'j', 'k', 'l']

const RebotDogControlButtons: FC = memo(() => {
  const params = useRebotDogControlRoomStore((s) => s.params)
  const { t } = useTranslation()

  const buttons = useMemo(
    () =>
      [
        {
          value: { yawSpeed: params.speed },
          btn: 'Q',
          identifier: 'yawSpeed',
          icon: <IconTurnLeft />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.turnLeft', {
            defaultValue: '左转',
          }),
        },
        {
          value: { xSpeed: params.speed },
          btn: 'W',
          identifier: 'xSpeed',
          icon: <IconUp />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.forward', {
            defaultValue: '前进',
          }),
        },
        {
          value: { yawSpeed: -params.speed },
          btn: 'E',
          identifier: 'yawSpeed',
          icon: <IconTurnRight />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.turnRight', {
            defaultValue: '右转',
          }),
        },
        {
          value: { ySpeed: params.speed },
          btn: 'A',
          identifier: 'ySpeed',
          icon: <IconLeft />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.moveLeft', {
            defaultValue: '左移',
          }),
        },
        {
          value: { xSpeed: -params.speed },
          btn: 'S',
          identifier: 'xSpeed',
          icon: <IconDown />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.back', {
            defaultValue: '后退',
          }),
        },
        {
          value: { ySpeed: -params.speed },
          btn: 'D',
          identifier: 'ySpeed',
          icon: <IconRight />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.moveRight', {
            defaultValue: '右移',
          }),
        },
        {
          value: { yaw: params.attitude },
          btn: 'U',
          identifier: 'yaw',
          icon: <IconTurnLeft3 />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.headLeft', {
            defaultValue: '左转头',
          }),
        },
        {
          value: { pitch: -params.attitude },
          btn: 'I',
          identifier: 'pitch',
          icon: <IconTurnOn />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.headUp', {
            defaultValue: '抬头',
          }),
        },
        {
          value: { yaw: -params.attitude },
          btn: 'O',
          identifier: 'yaw',
          icon: <IconTurnRight3 />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.headRight', {
            defaultValue: '右转头',
          }),
        },
        {
          value: { roll: -params.attitude },
          btn: 'J',
          identifier: 'roll',
          icon: <IconTurnLeft2 />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.headTiltLeft', {
            defaultValue: '左歪头',
          }),
        },
        {
          value: { pitch: params.attitude },
          btn: 'K',
          identifier: 'pitch',
          icon: <IconTurnDown />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.headDown', {
            defaultValue: '低头',
          }),
        },
        {
          value: { roll: params.attitude },
          btn: 'L',
          identifier: 'roll',
          icon: <IconTurnRight2 />,
          method: 'service.moveDog.post',
          label: t('controlRoom.rebotDog.controls.headTiltRight', {
            defaultValue: '右歪头',
          }),
        },
      ] as Btn[],
    [params],
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

  const speed = useRebotDogControlRoomStore(
    (s) => s.state.speed?.toFixed?.(1) ?? '-',
  )

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
            {t('controlRoom.rebotDog.speedAbbr', { defaultValue: 'SPD' })}
            <br />
            {t('controlRoom.rebotDog.speedUnit', { defaultValue: 'm/s' })}
          </span>
          <span className="text-lg">{speed}</span>
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
          <span className="text-lg">
            {t('controlRoom.rebotDog.altitudePlaceholder', { defaultValue: '-' })}
          </span>
          <span className="text-sm">
            {t('controlRoom.rebotDog.altitudeAbbr', { defaultValue: 'ALT' })}
            <br />
            {t('controlRoom.rebotDog.altitudeUnit', { defaultValue: 'm' })}
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
