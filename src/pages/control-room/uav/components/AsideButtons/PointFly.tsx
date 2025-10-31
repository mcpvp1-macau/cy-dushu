import IconPointFly from '@/assets/icons/jsx/uav/IconPointFly'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import useIdleControlTag from '../../hooks/useIdleControlTag'
import ServiceButton from './ServiceButton'

type PropsType = unknown

/** 指点飞行 */
const PointFly: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const openPointFly = useUavControlRoomStore((s) => s.pointFly.open)
  const updatePointFly = useUavControlRoomStore((s) => s.updatePointFly)
  const updateFlyParamsOpen = useUavControlRoomStore(
    (s) => s.updateFlyParamsOpen,
  )

  const isLimitedFly = useUavControlRoomStore((s) => s.isLimitedFly)
  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)
  const serviceHave = useDeviceDetailStore((s) => s.serviceHave['gotoPosition'])

  const idleControlTag = useIdleControlTag()

  const canPointFly =
    !isLimitedFly && (hasControlPower || idleControlTag) && serviceHave

  return (
    <ServiceButton
      disabled={!canPointFly}
      icon={IconPointFly}
      title={t('controlRoom.uav.service.tapToFly.title')}
      onClick={() => {
        updateFlyParamsOpen(true)
        updatePointFly({
          open: !openPointFly,
          targetPosition: null,
        })
      }}
    />
  )
})

export default PointFly
