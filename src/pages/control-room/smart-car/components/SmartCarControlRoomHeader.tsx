import IconBack from '@/assets/icons/jsx/IconBack'
import IconLatitude from '@/assets/jsx/IconLatitude'
import IconLongitude from '@/assets/jsx/IconLongitude'
import CommonDebugState from '@/components/control-room/header/DebugState'
import IconButton from '@/components/ui/button/IconButton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useSmartCarControlRoomStore } from '@/store/context-store/useSmartCarControlRoom.store'
import { Tooltip } from 'antd'
import { useMemoizedFn, useTitle } from 'ahooks'
import { HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { CarOutlined } from '@ant-design/icons'

const HeaderItem: FC<
  {
    icon: ReactNode
    tooltip?: ReactNode
    value: ReactNode
  } & HTMLAttributes<HTMLLIElement>
> = memo(({ icon, tooltip, value, ...props }) => {
  return (
    <li className="flex items-center gap-1 select-none" {...props}>
      <Tooltip title={tooltip} mouseEnterDelay={0.3}>
        <span className="flex items-center text-sm text-fore-2">{icon}</span>
      </Tooltip>
      <div className="text-sm text-fore">{value}</div>
    </li>
  )
})

HeaderItem.displayName = 'HeaderItem'

const DebugState: FC = memo(() => {
  const state = useSmartCarControlRoomStore((s) => s.state)
  return <CommonDebugState state={state} />
})

DebugState.displayName = 'DebugState'

const SmartCarControlRoomHeader: FC = memo(() => {
  const deviceName = useDeviceDetailStore((s) => s.deviceDetail?.deviceName)
  const deviceTags = useDeviceDetailStore((s) => s.deviceDetail?.deviceTags)
  const navigate = useNavigate()
  const { t } = useTranslation()

  useTitle(`${deviceName ?? '-'} | ${globalConfig.title}`)

  const longitude = useSmartCarControlRoomStore((s) => s.state.longitude)
  const latitude = useSmartCarControlRoomStore((s) => s.state.latitude)
  const plateNumber = useMemo(
    () =>
      // 业务规则：号牌号码使用设备标签映射。
      deviceTags?.find(
        (item) =>
          item?.tagName === 'PLATE_NUMBER' || item?.tagName === 'CARD_NUMBER',
      )?.tagValue ?? '-',
    [deviceTags],
  )

  const formatCoordinate = useMemoizedFn((value?: number) => {
    if (typeof value !== 'number') {
      return '-'
    }

    return value.toFixed(6)
  })

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
              icon={<IconLongitude />}
              tooltip={t('common.longitude')}
              value={formatCoordinate(longitude)}
            />
            <HeaderItem
              icon={<IconLatitude />}
              tooltip={t('common.latitude')}
              value={formatCoordinate(latitude)}
            />
            <HeaderItem
              icon={<CarOutlined />}
              tooltip={t('smartCar.info.plateNumber', {
                defaultValue: '号牌号码',
              })}
              value={plateNumber}
            />
            <DebugState />
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
