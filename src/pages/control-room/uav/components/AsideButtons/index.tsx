import { Button } from 'antd'
import ControlPower from './ControlPower'
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
import IntelligentPhotographyV1 from './IntelligentPhotographV1'
import ServiceButton from './ServiceButton'

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

  const deviceModel = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.deviceTags.find((e) => e.tagName === 'MODEL_NUMBER')
        ?.tagValue || 'UNKNOWN',
  )

  return (
    <div className="flex flex-col gap-2.5 @container">
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
          <span className="hidden @[400px]:block">
            {t('controlRoom.uav.service.boxZoom.title')}
          </span>
        </Button>
        {globalConfig.intelligentPhotographV1Filter?.includes(deviceModel) ? (
          <IntelligentPhotographyV1 postServiceFn={postSerivce} />
        ) : [2, 3].includes(globalConfig.intelligentPhotographVersion ?? -1) ? (
          <IntelligentPhotography postServiceFn={postSerivce} />
        ) : (
          <IntelligentPhotographyV1 postServiceFn={postSerivce} />
        )}
        <Gamepad />
      </div>
      <div className="flex justify-between gap-2.5">
        <Takeoff postServiceFn={postSerivce} />
        <PointFly />
        <ServiceButton
          disabled={!canStopAll}
          icon={IconStopCircle}
          title={t('controlRoom.uav.service.stopAll.title')}
          onClick={() => postSerivce('stopAll')}
        />
        <ServiceButton
          disabled={!canGohome}
          icon={IconReturnBase}
          title={t('controlRoom.uav.service.goHome.title')}
          onClick={() => postSerivce('gohome')}
        />
        <ServiceButton
          disabled={!canAutoland}
          icon={IconLanding}
          title={t('controlRoom.uav.service.autoland.title')}
          onClick={() => postSerivce('autoland')}
        />
      </div>
    </div>
  )
})

AsideButtons.displayName = 'AsideButtons'

export default AsideButtons
