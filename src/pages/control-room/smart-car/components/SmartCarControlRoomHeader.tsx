import IconBack from '@/assets/icons/jsx/IconBack'
import IconLatitude from '@/assets/jsx/IconLatitude'
import IconLongitude from '@/assets/jsx/IconLongitude'
import IconButton from '@/components/ui/button/IconButton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { Tag, Tooltip } from 'antd'
import { useTitle } from 'ahooks'
import { HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'

const HeaderItem: FC<
  {
    icon?: ReactNode
    label: ReactNode
    value: ReactNode
  } & HTMLAttributes<HTMLLIElement>
> = memo(({ icon, label, value, ...props }) => {
  return (
    <li className="flex items-center gap-1 select-none" {...props}>
      {icon ? <span className="text-sm text-fore-2">{icon}</span> : null}
      <span className="text-sm text-fore-2">{label}</span>
      <div className="text-sm text-fore">{value}</div>
    </li>
  )
})

HeaderItem.displayName = 'HeaderItem'

const SmartCarControlRoomHeader: FC = memo(() => {
  const deviceName = useDeviceDetailStore((s) => s.deviceDetail?.deviceName)
  const navigate = useNavigate()

  useTitle(`${deviceName ?? '-'} | ${globalConfig.title}`)

  const mockInfo = useMemo(
    () => ({
      // 业务规则：驾驶舱头部信息暂时使用固定数据占位展示。
      online: true,
      longitude: 120.1551,
      latitude: 30.2741,
      plateNumber: '浙A12345',
    }),
    [],
  )

  const appHeader = useMemo(
    () => document.getElementById('app-header-center'),
    [],
  )

  const header = (
    <header className="flex items-center justify-between px-3 py-2 text-sm">
      {appHeader ? (
        <section className="flex items-center gap-3">
          <IconButton className="text-base" onClick={() => navigate(-1)}>
            <IconBack />
          </IconButton>
          <h3 className="whitespace-nowrap">{deviceName ?? '-'}</h3>
        </section>
      ) : (
        <div />
      )}
      <ScrollArea className="w-full h-full">
        <div className="flex-1 flex items-center justify-center gap-3">
          <ul className="flex gap-4 whitespace-nowrap">
            <HeaderItem
              label="在线状态"
              value={
                <Tag color={mockInfo.online ? 'success' : 'default'}>
                  {mockInfo.online ? '在线' : '离线'}
                </Tag>
              }
            />
            <HeaderItem
              icon={
                <Tooltip title="经度" mouseEnterDelay={0.3}>
                  <span className="flex items-center">
                    <IconLongitude />
                  </span>
                </Tooltip>
              }
              label="经度"
              value={mockInfo.longitude.toFixed(6)}
            />
            <HeaderItem
              icon={
                <Tooltip title="纬度" mouseEnterDelay={0.3}>
                  <span className="flex items-center">
                    <IconLatitude />
                  </span>
                </Tooltip>
              }
              label="纬度"
              value={mockInfo.latitude.toFixed(6)}
            />
            <HeaderItem label="车牌号码" value={mockInfo.plateNumber} />
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

SmartCarControlRoomHeader.displayName = 'SmartCarControlRoomHeader'

export default SmartCarControlRoomHeader
