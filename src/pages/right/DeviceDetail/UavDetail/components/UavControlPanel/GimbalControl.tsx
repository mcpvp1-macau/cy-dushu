import { Button, InputNumber } from 'antd'
import controlBG from '@/assets/imgs/control/buttonBg.png'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import CircleButton from './CircleButton'
import { useRafInterval, useResetState } from 'ahooks'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '../../../hooks/useDeviceDetail.store'
import useUavZoomFactorChange from '@/pages/control-room/uav/hooks/useZoomFactorChange'
import { isNil, round } from 'lodash'

type PropsType = unknown

const controls1 = [
  ['上', 'left-1/2 -translate-x-1/2', { pitch: 15 }],
  ['下', 'left-1/2 bottom-0 -translate-x-1/2', { pitch: -15 }],
  ['左', 'top-1/2 -translate-y-1/2', { yaw: -15 }],
  ['右', 'top-1/2 right-0 -translate-y-1/2', { yaw: 15 }],
] as const

/** 云台模式控制按钮 */
const GimbalButton: FC<{
  lensType: 'zoom' | 'ir' | 'wide'
  type: 'zoom' | 'ir' | 'wide'
  gimbalDataTypes: any[]
  canControl: boolean
  label: string
  isGimbalSource?: boolean
  onClick?: (string) => void
}> = memo(
  ({
    lensType,
    type,
    canControl,
    gimbalDataTypes,
    label,
    isGimbalSource,
    onClick,
  }) => {
    return (
      <Button
        block
        size="small"
        type={lensType === type ? 'primary' : 'default'}
        disabled={
          !isGimbalSource ||
          !canControl ||
          !gimbalDataTypes?.find((e) => e.type === type)
        }
        onClick={() => onClick?.(type)}
      >
        {label}
      </Button>
    )
  },
)

const UavDetailGimbalControl: FC<PropsType> = memo(() => {
  const wsReadyState = useUavControlRoomStore((s) => s.wsReadyState)
  const lensType = useUavControlRoomStore((s) => s.state.lensType)

  const canControl = wsReadyState === WebSocket.OPEN

  const sendCommand = useUavControlRoomStore((s) => s.sendCommand)
  const [downKey, setDownKey, reset] = useResetState<Record<
    string,
    number
  > | null>(null)

  useRafInterval(
    () => {
      sendCommand('service.moveGimbal.post', downKey)
    },
    downKey ? 60 : undefined,
  )

  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const postService = usePostDeviceService(productKey, deviceId)

  const videoId = deviceDetail?.properties.videoList?.[0]?.videoId
  const gimbalDataTypes =
    deviceDetail?.properties?.videoList?.[0]?.sources?.find(
      (item: any) => item.id === 'gimbal',
    )?.types

  const isGimbalSource =
    useUavControlRoomStore((s) => s.state.videoSource) === 'gimbal'

  const gimbalTypes = useRef([
    ['zoom', '变焦模式'],
    ['ir', '红外模式'],
    ['wide', '广角模式'],
  ] as const).current

  const handleLensTypeChange = useMemoizedFn((type: string) => {
    postService('liveLensChange', { lensType: type, videoId })
  })

  const [zoomFactor, setZoomFactor] = useUavZoomFactorChange()

  return (
    <div className="p-3 flex items-center justify-between gap-3">
      <div className="flex flex-col gap-3 w-[90px]">
        {gimbalTypes.map(([type, label]) => (
          <GimbalButton
            key={type}
            lensType={lensType as any}
            type={type}
            label={label}
            canControl={canControl}
            isGimbalSource={isGimbalSource}
            gimbalDataTypes={gimbalDataTypes ?? []}
            onClick={handleLensTypeChange}
          />
        ))}
        <div className="flex gap-1 whitespace-nowrap">
          <span>焦距:</span>{' '}
          <InputNumber
            size="small"
            min={2}
            max={200}
            value={round(zoomFactor)}
            onChange={(v) => !isNil(v) && setZoomFactor(v)}
            disabled={!canControl || !isGimbalSource}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="relative h-[100px] w-[100px] select-none">
          <img className="size-full" src={controlBG} alt="" />
          <div className="absolute inset-1">
            {controls1.map(([title, className, payload]) => (
              <CircleButton
                key={title}
                className={className}
                disabled={!canControl || !isGimbalSource}
                onMouseDown={() => setDownKey(payload)}
                onMouseUp={reset}
                onMouseLeave={reset}
              >
                {title}
              </CircleButton>
            ))}
          </div>
        </div>
        <div>
          <Button
            type="primary"
            block
            size="small"
            disabled={!canControl || !isGimbalSource}
            onClick={() => postService('resetGimbal')}
          >
            复位
          </Button>
        </div>
      </div>
      <div>
        <div className="relative h-[100px] w-[100px]" />
      </div>
    </div>
  )
})

UavDetailGimbalControl.displayName = 'UavDetailGimbalControl'

export default UavDetailGimbalControl
