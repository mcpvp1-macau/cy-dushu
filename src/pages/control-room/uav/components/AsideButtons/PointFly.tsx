import IconPointFly from '@/assets/icons/jsx/uav/IconPointFly'
import VerticalIconButton from '@/components/ui/button/VerticalButton'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import useIdleControlTag from '../../hooks/useIdleControlTag'

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
      {t('controlRoom.uav.service.tapToFly.title')}
    </VerticalIconButton>
  )
})

export default PointFly
