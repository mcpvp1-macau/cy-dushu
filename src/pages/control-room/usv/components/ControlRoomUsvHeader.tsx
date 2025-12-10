import IconBack from '@/assets/icons/jsx/IconBack'
import IconButton from '@/components/ui/button/IconButton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'
import { Tooltip } from 'antd'
import { useTitle } from 'ahooks'
import { HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import IconBattery from '@/assets/icons/jsx/IconBattery'
import { CompassOutlined, DashboardOutlined, EnvironmentOutlined } from '@ant-design/icons'

const HeaderItem: FC<
  { icon: ReactNode; tooltip?: ReactNode; value: ReactNode } &
    HTMLAttributes<HTMLLIElement>
> = memo(({ icon, tooltip, value, ...props }) => {
  return (
    <li className="flex items-center gap-1 select-none" {...props}>
      <Tooltip title={tooltip} mouseEnterDelay={0.3}>
        <span className="flex items-center text-base text-fore-2">{icon}</span>
      </Tooltip>
      <div className="text-sm text-fore">{value}</div>
    </li>
  )
})

HeaderItem.displayName = 'HeaderItem'

const ControlRoomUsvHeader: FC = memo(() => {
  const deviceName = useDeviceDetailStore((s) => s.deviceDetail?.deviceName)

  const { t } = useTranslation()
  useTitle(`${deviceName ?? '-'} | ${globalConfig.title}`)

  const navigate = useNavigate()

  const batteryPercentage = useUsvControlRoomStore(
    (s) => s.state?.batteryPercentage,
  )
  const heading = useUsvControlRoomStore((s) => s.state?.heading)
  const course = useUsvControlRoomStore((s) => s.state?.course)
  const speed = useUsvControlRoomStore((s) => s.state?.speed)
  const longitude = useUsvControlRoomStore((s) => s.state?.longitude)
  const latitude = useUsvControlRoomStore((s) => s.state?.latitude)

  const headingValue = course ?? heading

  const appHeader = document.getElementById('app-header-center')

  const header = (
    <header className="flex items-center justify-between px-3 py-2 text-sm">
      {appHeader ? (
        <section className="flex items-center gap-3">
          <IconButton className="text-base" onClick={() => navigate(-1)}>
            <IconBack />
          </IconButton>
          <h3 className="whitespace-nowrap">{deviceName}</h3>
        </section>
      ) : (
        <div />
      )}
      <ScrollArea className="w-full h-full ml-3">
        <div className="flex items-center gap-3">
          <ul className="flex gap-4 whitespace-nowrap">
            <HeaderItem
              icon={<IconBattery className="text-lg" />}
              tooltip={t('common.electricity')}
              value={
                batteryPercentage !== undefined && batteryPercentage !== null
                  ? `${batteryPercentage}%`
                  : '-'
              }
            />
            <HeaderItem
              icon={<CompassOutlined />}
              tooltip={t('controlRoom.uav.header.heading.title')}
              value={
                headingValue !== undefined && headingValue !== null
                  ? `${headingValue.toFixed(1)}°`
                  : '-'
              }
            />
            <HeaderItem
              icon={<DashboardOutlined />}
              tooltip={t('common.speed')}
              value={
                speed !== undefined && speed !== null
                  ? `${speed.toFixed(1)} m/s`
                  : '-'
              }
            />
            <HeaderItem
              icon={<EnvironmentOutlined />}
              tooltip={t('common.longitude')}
              value={
                longitude !== undefined && longitude !== null
                  ? longitude.toFixed(6)
                  : '-'
              }
            />
            <HeaderItem
              icon={<EnvironmentOutlined />}
              tooltip={t('common.latitude')}
              value={
                latitude !== undefined && latitude !== null
                  ? latitude.toFixed(6)
                  : '-'
              }
            />
          </ul>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </header>
  )

  if (appHeader) {
    return createPortal(header, appHeader)
  }

  return <div className="bg-ground-3 mx-2 rounded mt-2">{header}</div>
})

ControlRoomUsvHeader.displayName = 'ControlRoomUsvHeader'

export default ControlRoomUsvHeader
