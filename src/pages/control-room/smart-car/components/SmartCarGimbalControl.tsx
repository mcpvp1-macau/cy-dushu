import { Button, Tooltip } from 'antd'
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
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import IconButton from '@/components/ui/button/IconButton'

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
  const sendCommand = useSmartCarGimbalControlRoomStore((s) => s.sendCommand)

  const canControl = !!(productKey && deviceId && hasControlPower)

  const handleReset = useMemoizedFn(() => {
    if (!canControl) {
      return
    }
    // 业务规则：云台复位固定回到 1 号预置位。
    postService(
      'gotoPreset',
      { index: 1 },
      t('controlRoom.control.gimbalReset.title', { defaultValue: '复位' }),
    )
  })

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

  const [zoomKey, setZoomKey, resetZoom] = useResetState<number | null>(null)

  // 按住按钮时每 500ms 发送一次
  useRafInterval(
    () => {
      sendCommand('moveGimbal', downKey)
    },
    downKey && canControl ? 500 : undefined,
  )

  // 按住变焦按钮时每 500ms 发送一次
  useRafInterval(
    () => {
      sendCommand('liveZoomChange', {
        videoId: 'live',
        zoomFactor: zoomKey,
      })
    },
    zoomKey && canControl ? 500 : undefined,
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
    <div className="size-full flex flex-col items-center justify-center gap-3 p-3">
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-[100px] w-[100px] select-none">
            <img className="size-full" src={controlBG} alt="" />
            <div className="absolute inset-1">
              {controls.map(
                ([title, className, payload, tooltip, placement], i) => (
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
                ),
              )}
            </div>
          </div>

          <Button type="primary" disabled={!canControl} onClick={handleReset}>
            {t('controlRoom.control.gimbalReset.title', {
              defaultValue: '复位',
            })}
          </Button>
        </div>

        {/* 变焦倍数控制 */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col gap-2">
            <Tooltip
              title={t('controlRoom.control.zoomOut.title', {
                defaultValue: '缩小',
              })}
            >
              <IconButton
                className="text-2xl text-primary"
                disabled={!canControl}
                onMouseDown={() => setZoomKey(-1)}
                onTouchStart={() => setZoomKey(-1)}
                onMouseUp={resetZoom}
                onMouseLeave={resetZoom}
                onTouchEnd={resetZoom}
                onTouchCancel={resetZoom}
              >
                <ZoomOutOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={t('controlRoom.control.zoomIn.title', {
                defaultValue: '放大',
              })}
            >
              <IconButton
                className="text-2xl text-primary"
                disabled={!canControl}
                onMouseDown={() => setZoomKey(1)}
                onTouchStart={() => setZoomKey(1)}
                onMouseUp={resetZoom}
                onMouseLeave={resetZoom}
                onTouchEnd={resetZoom}
                onTouchCancel={resetZoom}
              >
                <ZoomInOutlined />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
})

SmartCarGimbalControl.displayName = 'SmartCarGimbalControl'

export default SmartCarGimbalControl
