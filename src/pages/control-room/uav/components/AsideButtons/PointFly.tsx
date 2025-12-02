import IconPointFly from '@/assets/icons/jsx/uav/IconPointFly'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import useIdleControlTag from '../../hooks/useIdleControlTag'
import ServiceButton from './ServiceButton'

type PointFlyProps = {
  canFly: boolean
  disabledReason?: string
  loading?: boolean
}

/** 指点飞行 */
const PointFly: FC<PointFlyProps> = memo(
  ({ canFly, disabledReason, loading }) => {
    const { t } = useTranslation()

    const openPointFly = useUavControlRoomStore((s) => s.pointFly.open)
    const updatePointFly = useUavControlRoomStore((s) => s.updatePointFly)
    const updateFlyParamsOpen = useUavControlRoomStore(
      (s) => s.updateFlyParamsOpen,
    )

    const isLimitedFly = useUavControlRoomStore((s) => s.isLimitedFly)
    const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)
    const serviceHave = useDeviceDetailStore(
      (s) => s.serviceHave['gotoPosition'],
    )

    const idleControlTag = useIdleControlTag()

    const canPointFly =
      !isLimitedFly &&
      (hasControlPower || idleControlTag) &&
      serviceHave &&
      canFly

    return (
      <ServiceButton
        disabled={!canPointFly}
        tooltip={!canFly ? disabledReason : undefined}
        icon={IconPointFly}
        title={t('controlRoom.uav.service.tapToFly.title')}
        loading={loading}
        onClick={() => {
          updateFlyParamsOpen(true)
          updatePointFly({
            open: !openPointFly,
            targetPosition: null,
          })
        }}
      />
    )
  },
)

export default PointFly
