import { Button } from 'antd'
import ControlPower from './ControlPower'
import VerticalIconButton from '@/components/ui/button/VerticalButton.tsx'
import IconReturnBase from '@/assets/icons/jsx/uav/IconReturnBase'
import IconLanding from '@/assets/icons/jsx/uav/IconLanding'
import IconBoxSelect from '@/assets/icons/jsx/uav/IconBoxSelect'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import IconStopCircle from '@/assets/icons/jsx/IconStopCircle'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import Gamepad from './Gamepad'
import Takeoff from './Takeoff'
// import IntelligentPhotographyV1 from './IntelligentPhotographV1'
import PointFly from './PointFly'
import IntelligentPhotography from './IntelligentPhotograph'

type PropsType = unknown

const AsideButtons: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)
  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const isLimitedFly = useUavControlRoomStore((s) => s.isLimitedFly)

  const canBoxSelect =
    !isLimitedFly && hasControlPower && serviceHave['gimbalToPoint']

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

  return (
    <div className="flex flex-col gap-2.5">
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
          {t('controlRoom.uav.service.boxZoom.title')}
        </Button>
        <IntelligentPhotography postServiceFn={postSerivce} />
        {/* <IntelligentPhotographyV1 postServiceFn={postSerivce} /> */}
        <Gamepad />
      </div>
      <div className="flex justify-between gap-2.5">
        <Takeoff postServiceFn={postSerivce} />
        <PointFly />
        <VerticalIconButton
          className="flex-1 h-11 p-1 text-xs"
          disabled={!canStopAll}
          icon={<IconStopCircle className="text-base" />}
          onClick={() => postSerivce('stopAll')}
        >
          {t('controlRoom.uav.service.stopAll.title')}
        </VerticalIconButton>
        <VerticalIconButton
          className="flex-1 h-11 p-1 text-xs"
          disabled={!canGohome}
          icon={<IconReturnBase className="text-base" />}
          onClick={() => postSerivce('gohome')}
        >
          {t('controlRoom.uav.service.goHome.title')}
        </VerticalIconButton>
        <VerticalIconButton
          className="flex-1 h-11 p-1 text-xs"
          disabled={!canAutoland}
          icon={<IconLanding className="text-base" />}
          onClick={() => postSerivce('autoland')}
        >
          {t('controlRoom.uav.service.autoland.title')}
        </VerticalIconButton>
      </div>
    </div>
  )
})

AsideButtons.displayName = 'AsideButtons'

export default AsideButtons
