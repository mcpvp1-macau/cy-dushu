import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { createPortal } from 'react-dom'
import IconBattery from '@/assets/icons/jsx/IconBattery'
import IconButton from '@/components/ui/button/IconButton'
import IconBack from '@/assets/icons/jsx/IconBack'
import LatestTask from '@/components/device/LatestTask'
import { DeviceEnum } from '@/enum/device'

const useS = useRebotDogControlRoomStore

// Item component for header items
const I: FC<{
  t: string
  l: React.ReactNode
  v: React.ReactNode
}> = memo(({ t, l, v }) => {
  return (
    <li className="flex items-center gap-1 px-2 py-0.5" title={t}>
      <span className="text-xs opacity-80">{l}</span>
      <span className="text-xs">{v}</span>
    </li>
  )
})

// Battery component
const Battery = memo(() => {
  const { t } = useTranslation()
  const electricity = useS((s) => s.state.electricity)

  return (
    <I
      t={t('common.electricity')}
      l={<IconBattery className="text-green-500" />}
      v={<span>{electricity ?? '-'}%</span>}
    />
  )
})

// Speed component
const Speed = memo(() => {
  const { t } = useTranslation()
  const speed = useS((s) => s.state.speed)

  return (
    <I
      t={t('common.speed')}
      l={'SPD'}
      v={<span>{speed?.toFixed(1) ?? '-'} m/s</span>}
    />
  )
})

// HeaderLeft component
const HeaderLeft = memo(() => {
  const deviceName = useDeviceDetailStore((s) => s.deviceDetail?.deviceName)

  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-2">
      <IconButton
        onClick={() => {
          navigate(-1)
        }}
      >
        <IconBack />
      </IconButton>
      <span className="text-xs">{deviceName}</span>
    </div>
  )
})

const ControlRoomRebotDogHeader: FC = memo(() => {
  const appHeader = document.getElementById('app-header-center')
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const h = (
    <header className="h-7 flex justify-between gap-3 px-3 items-center text-sm">
      {appHeader ? <HeaderLeft /> : <div />}
      <section className="grow">
        <ul className="flex justify-center gap-1 xl:gap-3 2xl:gap-5 whitespace-nowrap">
          <Battery />
          <Speed />
          <LatestTask deviceId={deviceId} deviceType={DeviceEnum.ROBOT_DOG} />
        </ul>
      </section>
      <section></section>
    </header>
  )

  if (appHeader) {
    return createPortal(h, appHeader)
  }

  return <div className="bg-ground-3 mx-2 rounded mt-2">{h}</div>
})

ControlRoomRebotDogHeader.displayName = 'ControlRoomRebotDogHeader'

export default ControlRoomRebotDogHeader
