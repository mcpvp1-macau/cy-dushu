import IconBack from '@/assets/icons/jsx/IconBack'
import IconButton from '@/components/ui/button/IconButton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'
import { useTitle } from 'ahooks'
import { HTMLAttributes } from 'react'

const HeaderItem: FC<
  { label: ReactNode; value: ReactNode } & HTMLAttributes<HTMLLIElement>
> = memo(({ label, value, ...props }) => {
  return (
    <li className="flex gap-1 select-none" {...props}>
      <div className="text-xs text-fore-2">{label}</div>
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

  return (
    <div className="bg-ground-3 mx-2 rounded mt-2">
      <header className="flex items-center justify-between px-3 py-2 text-sm">
        <section className="flex items-center gap-3">
          <IconButton className="text-base" onClick={() => navigate(-1)}>
            <IconBack />
          </IconButton>
          <h3 className="whitespace-nowrap">{deviceName}</h3>
        </section>
        <ScrollArea className="w-full h-full ml-3">
          <div className="flex items-center gap-3">
            <ul className="flex gap-4 whitespace-nowrap">
              <HeaderItem
                label={t('common.electricity')}
                value={
                  batteryPercentage !== undefined && batteryPercentage !== null
                    ? `${batteryPercentage}%`
                    : '-'
                }
              />
              <HeaderItem
                label={t('controlRoom.uav.header.heading.title')}
                value={
                  headingValue !== undefined && headingValue !== null
                    ? `${headingValue.toFixed(1)}°`
                    : '-'
                }
              />
              <HeaderItem
                label={t('common.speed')}
                value={
                  speed !== undefined && speed !== null
                    ? `${speed.toFixed(1)} m/s`
                    : '-'
                }
              />
              <HeaderItem
                label={t('common.longitude')}
                value={
                  longitude !== undefined && longitude !== null
                    ? longitude.toFixed(6)
                    : '-'
                }
              />
              <HeaderItem
                label={t('common.latitude')}
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
    </div>
  )
})

ControlRoomUsvHeader.displayName = 'ControlRoomUsvHeader'

export default ControlRoomUsvHeader
