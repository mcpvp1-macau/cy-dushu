import { Button } from 'antd'
import ControlPower from './ControlPower'
import VerticalIconButton from '@/components/ui/button/VerticalButton.tsx'
import IconPointFly from '@/assets/icons/jsx/uav/IconPointFly'
import IconReturnBase from '@/assets/icons/jsx/uav/IconReturnBase'
import IconLanding from '@/assets/icons/jsx/uav/IconLanding'
import IconBoxSelect from '@/assets/icons/jsx/uav/IconBoxSelect'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import IconStopCircle from '@/assets/icons/jsx/IconStopCircle'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import IntelligentPhotography from './IntelligentPhotograph'
import Gamepad from './Gamepad'
import Takeoff from './Takeoff'

type PropsType = unknown

const AsideButtons: FC<PropsType> = memo(() => {
  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)
  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const isLimitedFly = useUavControlRoomStore((s) => s.isLimitedFly)

  const canBoxSelect =
    !isLimitedFly && hasControlPower && serviceHave['gimbalToPoint']

  const canPointFly =
    !isLimitedFly && hasControlPower && serviceHave['gotoPosition']

  const canStopAll = serviceHave['stopAll']

  const canGohome = !isLimitedFly && serviceHave['gohome']

  const canAutoland =
    !isLimitedFly && hasControlPower && serviceHave['autoland']

  const openPointZoom = useUavControlRoomStore((s) => s.openPointZoom)
  const updateOpenPointZoom = useUavControlRoomStore(
    (s) => s.updateOpenPointZoom,
  )

  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const postSerivce = usePostDeviceService(productKey, deviceId)

  const updateFlyParamsOpen = useUavControlRoomStore(
    (s) => s.updateFlyParamsOpen,
  )

  const openPointFly = useUavControlRoomStore((s) => s.pointFly.open)
  const updatePointFly = useUavControlRoomStore((s) => s.updatePointFly)

  return (
    <div className="p-3 pt-0.5 flex flex-col gap-2.5">
      <div>
        <ControlPower />
      </div>
      <div className="flex justify-between gap-2.5">
        <Button
          className="grow h-[26px] px-0"
          disabled={!canBoxSelect}
          icon={<IconBoxSelect />}
          type={openPointZoom === 2 ? 'primary' : 'default'}
          onClick={() => updateOpenPointZoom(openPointZoom === 2 ? 0 : 2)}
        >
          框选
        </Button>
        <IntelligentPhotography postServiceFn={postSerivce} />
        <Gamepad />
      </div>
      <div className="flex justify-between gap-2.5">
        <Takeoff postServiceFn={postSerivce} />
        <VerticalIconButton
          className={clsx('flex-1 h-10 p-0 text-xs', {
            'text-primary': openPointFly,
          })}
          disabled={!canPointFly}
          icon={<IconPointFly className="text-base" />}
          onClick={() => {
            updateFlyParamsOpen(true)
            updatePointFly({
              open: !openPointFly,
              targetPosition: null,
            })
          }}
        >
          指点飞行
        </VerticalIconButton>
        <VerticalIconButton
          className="flex-1 h-10 p-0 text-xs"
          disabled={!canStopAll}
          icon={<IconStopCircle className="text-base" />}
          onClick={() => postSerivce('stopAll')}
        >
          紧急停止
        </VerticalIconButton>
        <VerticalIconButton
          className="flex-1 h-10 p-0 text-xs"
          disabled={!canGohome}
          icon={<IconReturnBase className="text-base" />}
          onClick={() => postSerivce('gohome')}
        >
          返航
        </VerticalIconButton>
        <VerticalIconButton
          className="flex-1 h-10 p-0 text-xs"
          disabled={!canAutoland}
          icon={<IconLanding className="text-base" />}
          onClick={() => postSerivce('autoland')}
        >
          降落
        </VerticalIconButton>
      </div>
    </div>
  )
})

AsideButtons.displayName = 'AsideButtons'

export default AsideButtons
