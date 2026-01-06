import { Tooltip } from 'antd'
import controlBG from '@/assets/imgs/control/buttonBg.png'
import { useResetState, useRafInterval } from 'ahooks'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import IconUp from '@/assets/icons/jsx/IconUp'
import IconDown from '@/assets/icons/jsx/IconDown'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconRight from '@/assets/icons/jsx/IconRight'
import CircleButton from '@/pages/right/DeviceDetail/UavDetail/components/UavControlPanel/CircleButton'
import AppEmpty from '@/components/AppEmpty'
import { useSmartCarGimbalControlRoomStore } from '@/store/context-store/useSmartCarGimbalControlRoom.store'

type PropsType = {
  gimbalDevice?: API_DEVICE.domain.Device | null
}

const SmartCarGimbalControl: FC<PropsType> = memo(({ gimbalDevice }) => {
  const { t } = useTranslation()

  const productKey =
    gimbalDevice?.productKey ?? gimbalDevice?.deviceModel?.productKey ?? ''
  const deviceId = gimbalDevice?.deviceId ?? ''

  const postService = usePostDeviceService(productKey, deviceId)
  const hasControlPower = useSmartCarGimbalControlRoomStore(
    (s) => s.hasControlPower,
  )

  const canControl = !!(productKey && deviceId && hasControlPower)

  const controls = [
    [
      <IconUp />,
      'left-1/2 -translate-x-1/2',
      { pitch: 1, yaw: 0 },
      t('controlRoom.control.gimbalTiltUp.title', { defaultValue: '云台上仰' }),
      'top',
    ],
    [
      <IconDown />,
      'left-1/2 bottom-0 -translate-x-1/2',
      { pitch: -1, yaw: 0 },
      t('controlRoom.control.gimbalTiltDown.title', {
        defaultValue: '云台下俯',
      }),
      'bottom',
    ],
    [
      <IconLeft />,
      'top-1/2 -translate-y-1/2',
      { pitch: 0, yaw: -1 },
      t('controlRoom.control.gimbalTurnLeft.title', {
        defaultValue: '云台左转',
      }),
      'left',
    ],
    [
      <IconRight />,
      'top-1/2 right-0 -translate-y-1/2',
      { pitch: 0, yaw: 1 },
      t('controlRoom.control.gimbalTurnRight.title', {
        defaultValue: '云台右转',
      }),
      'right',
    ],
  ] as const

  const [downKey, setDownKey, reset] = useResetState<{
    pitch: number
    yaw: number
  } | null>(null)

  // 按住按钮时每 500ms 发送一次
  useRafInterval(
    () => {
      postService('moveGimbal', downKey, undefined, false)
    },
    downKey && canControl ? 500 : undefined,
  )

  if (!gimbalDevice?.deviceId) {
    return (
      <div className="size-full flex flex-col justify-center items-center text-sm">
        <AppEmpty
          description={t('controlRoom.smartCar.noGimbal', {
            defaultValue: '暂无云台设备',
          })}
        />
      </div>
    )
  }

  return (
    <div className="size-full flex flex-col justify-center items-center p-3">
      <div className="relative h-[100px] w-[100px] select-none">
        <img className="size-full" src={controlBG} alt="" />
        <div className="absolute inset-1">
          {controls.map(([title, className, payload, tooltip, placement], i) => (
            <Tooltip key={i} title={tooltip} placement={placement}>
              <CircleButton
                className={className}
                disabled={!canControl}
                onMouseDown={() => setDownKey(payload)}
                onTouchStart={() => setDownKey(payload)}
                onMouseUp={reset}
                onMouseLeave={reset}
                onTouchEnd={reset}
                onTouchCancel={reset}
              >
                {title}
              </CircleButton>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  )
})

SmartCarGimbalControl.displayName = 'SmartCarGimbalControl'

export default SmartCarGimbalControl
