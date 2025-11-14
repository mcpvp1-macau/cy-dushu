import IconButton from '@/components/ui/button/IconButton'
import IconBack from '@/assets/icons/jsx/IconBack'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUGVControlRoomStore } from '@/store/context-store/useUGVControlRoom.store'
import { createPortal } from 'react-dom'
import IconBattery from '@/assets/icons/jsx/IconBattery'
import LatestTask from '@/components/device/LatestTask'
import QuickCreateAction from '@/components/device/QuickCreateAction'
import { DeviceEnum } from '@/enum/device'

const Metric: FC<{
  title: string
  icon?: React.ReactNode
  value: React.ReactNode
}> = memo(({ title, icon, value }) => {
  return (
    <li
      className="flex items-center gap-1 rounded-full bg-ground-2/40 px-3 py-1 text-xs"
      title={title}
    >
      {icon ? <span className="text-green-500">{icon}</span> : null}
      <span className="text-ground-10">{title}</span>
      <span className="font-semibold text-ground-12">{value}</span>
    </li>
  )
})

const Battery = memo(() => {
  const electricity = useUGVControlRoomStore((s) => s.state.electricity)
  const { t } = useTranslation()

  const value =
    electricity === null || electricity === undefined
      ? '-'
      : `${electricity}%`

  return (
    <Metric
      title={t('common.electricity')}
      icon={<IconBattery className="size-3.5" />}
      value={<span className="tabular-nums">{value}</span>}
    />
  )
})

const Speed = memo(() => {
  const speed = useUGVControlRoomStore((s) => s.state.speed)
  return (
    <Metric
      title="速度"
      value={
        <span className="tabular-nums">
          {speed?.toFixed?.(1) ?? '-'}
          <span className="ml-0.5 text-[10px] text-ground-10">m/s</span>
        </span>
      }
    />
  )
})

const Position = memo(() => {
  const longitude = useUGVControlRoomStore((s) => s.state.longitude)
  const latitude = useUGVControlRoomStore((s) => s.state.latitude)
  return (
    <Metric
      title="坐标"
      value={
        <span className="tabular-nums">
          {longitude?.toFixed?.(4) ?? '-'}, {latitude?.toFixed?.(4) ?? '-'}
        </span>
      }
    />
  )
})

const Connection = memo(() => {
  const wsReadyState = useUGVControlRoomStore((s) => s.wsReadyState)
  const stateText = useMemo(() => {
    switch (wsReadyState) {
      case WebSocket.OPEN:
        return 'WebSocket 已连接'
      case WebSocket.CONNECTING:
        return 'WebSocket 连接中'
      case WebSocket.CLOSING:
        return 'WebSocket 断开中'
      case WebSocket.CLOSED:
        return 'WebSocket 已关闭'
      default:
        return '等待连接'
    }
  }, [wsReadyState])

  return <Metric title="链路" value={stateText} />
})

const HeaderLeft = memo(() => {
  const deviceName = useDeviceDetailStore((s) => s.deviceDetail?.deviceName)
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-2">
      <IconButton onClick={() => navigate(-1)}>
        <IconBack />
      </IconButton>
      <div className="text-xs font-semibold">{deviceName}</div>
    </div>
  )
})

const ControlRoomUGVHeader: FC = memo(() => {
  const appHeader = document.getElementById('app-header-center')
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const content = (
    <header className="flex h-10 items-center gap-3 px-4 text-sm">
      {appHeader ? <HeaderLeft /> : <div />}
      <div className="flex grow justify-center">
        <ul className="flex flex-wrap items-center gap-2">
          <Battery />
          <Speed />
          <Position />
          <Connection />
          <LatestTask deviceId={deviceId} />
          <QuickCreateAction deviceId={deviceId} deviceType={DeviceEnum.UGV} />
        </ul>
      </div>
      <div className="min-w-[32px]" />
    </header>
  )

  if (appHeader) {
    return createPortal(content, appHeader)
  }

  return (
    <div className="mx-3 mt-3 rounded-2xl border border-ground-3 bg-ground-1 shadow-sm">
      {content}
    </div>
  )
})

ControlRoomUGVHeader.displayName = 'ControlRoomUGVHeader'

export default ControlRoomUGVHeader
