import IconBack from '@/assets/icons/jsx/IconBack'
import IconBattery from '@/assets/icons/jsx/IconBattery'
import IconSatellite from '@/assets/icons/jsx/IconSatellite'
import IconHome from '@/assets/icons/jsx/uav/IconHome'
import SignalStrengthIcon from '@/components/device/SignalStrength'
import IconButton from '@/components/ui/button/IconButton'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import JCXT from '@/pages/right/DeviceDetail/UavAirportDetail/components/RemoteDebug/icons/JCXT'
import {
  useUavControlRoomStore as useS,
  useUavControlRoomStore,
} from '@/store/context-store/useUavControlRoom.store'
import { Tooltip } from 'antd'
import { isNil } from 'lodash'
import { useShallow } from 'zustand/react/shallow'
import LatestTask from './LatestTask'
import { useTitle } from 'ahooks'
import { HTMLAttributes, lazy } from 'react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { createPortal } from 'react-dom'
import IconButtonWithDropDownDialog from '@/components/ui/button/IconButtonWithDropDownDialog'
import { emtpyObject } from '@/constant/data'
import { BugOutlined } from '@ant-design/icons'

const DeviceLinkSwitch = lazy(
  () => import('@/components/device/DeviceLinkSwitch'),
)

const HeaderLeft = memo(() => {
  const deviceName = useDeviceDetailStore((s) => s.deviceDetail?.deviceName)
  const navigate = useNavigate()

  useTitle(`${deviceName ?? '-'} | ${globalConfig.title}`)

  return (
    <section className="flex items-center gap-3">
      <IconButton className="text-base" onClick={() => navigate(-1)}>
        <IconBack />
      </IconButton>
      <h3 className="whitespace-nowrap">{deviceName}</h3>
    </section>
  )
})

const I: FC<
  { l: ReactNode; v: ReactNode; t?: string } & HTMLAttributes<HTMLElement>
> = ({ l, v, t, ...props }) => {
  if (globalConfig.controlRoom?.uav?.particularHeader) {
    return (
      <li className="flex gap-1 select-none" {...props}>
        {t && `${t} `}
        {v}
      </li>
    )
  }
  return (
    <li className="flex gap-1 select-none">
      {!l ? null : t ? <Tooltip title={t}>{l}</Tooltip> : <div>{l}</div>}
      <div>{v}</div>
    </li>
  )
}

const Signal14G = memo(() => {
  const { t } = useTranslation()
  const signal = useS((s) => s.state.signal)
  const item = signal?.find((s) => s.type === '14G')
  if (isNil(item)) {
    return null
  }
  return (
    <I
      t={t('controlRoom.uav.header.14g.title')}
      l={'1.4G'}
      v={<SignalStrengthIcon value={item.sqe} max={5} />}
    />
  )
})

const SDRStrength = memo(() => {
  const { t } = useTranslation()
  const sdrStrength = useS((s) => s.state?.sdrStrength)
  if (isNil(sdrStrength)) {
    return null
  }
  return (
    <I
      t={t('controlRoom.uav.header.sdr.title')}
      l={<JCXT />}
      v={<SignalStrengthIcon value={sdrStrength ?? -1} max={5} />}
    ></I>
  )
})

const SignalStrength = memo(() => {
  const { t } = useTranslation()
  const { signalMode, signalStrength } = useS(
    useShallow((m) => {
      const s = m.state ?? {}
      return {
        signalMode: s.signalMode,
        signalStrength: s.signalStrength,
      }
    }),
  )

  return (
    <I
      t={`${signalMode} ${t('controlRoom.uav.header.signal.title')}`}
      l={signalMode || '4G'}
      v={<SignalStrengthIcon value={signalStrength ?? -1} max={5} />}
    />
  )
})

const fixedStatusMap = {
  '0': '未开始',
  '1': '收敛中',
  '2': '收敛成功',
  '3': '收敛失败',
}

const fixedStatusColorMap = {
  '0': 'text-fore',
  '1': 'text-orange-500',
  '2': 'text-green-500',
  '3': 'text-red-500',
}

const positionStateQualityMap = {
  '1': '1档',
  '2': '2档',
  '3': '3档',
  '4': '4档',
  '5': '5档',
  '10': 'RTK fixed',
}

const SatelliteNumber = memo(() => {
  const { t } = useTranslation()
  const satelliteNumber = useS((s) => s.state?.satelliteNumber)
  const positionState = useS((s) => s.state?.positionState ?? emtpyObject)
  return (
    <IconButtonWithDropDownDialog
      title={t('controlRoom.uav.header.satellite.title')}
      trigger={['click']}
      useDing
      dropdownRender={() => (
        <div className="p-2 text-xs">
          <ul className="flex flex-col gap-1">
            <li className="flex gap-2">
              <p>收敛状态</p>
              <p className={fixedStatusColorMap[positionState.isFixed] || ''}>
                {fixedStatusMap[positionState.isFixed] || '-'}
              </p>
            </li>
            <li className="flex gap-2">
              <p>搜星档位</p>
              <p>{positionStateQualityMap[positionState.quality] || '-'}</p>
            </li>
            <li className="flex gap-2">
              <p>GPS 搜星</p>
              <p>{positionState.gpsNumber || '-'}</p>
            </li>
            <li className="flex gap-2">
              <p>RTK 搜星</p>
              <p>{positionState.rtkNumber || '-'}</p>
            </li>
          </ul>
        </div>
      )}
    >
      <I
        l={<IconSatellite />}
        v={satelliteNumber ?? '-'}
        t={t('controlRoom.uav.header.satellite.title')}
      />
    </IconButtonWithDropDownDialog>
  )
})

const Battery = memo(() => {
  const { t } = useTranslation()
  const electricity = useS((s) => s.state?.electricity)

  const eleColor = useMemo(() => {
    // 电量正常
    if (isNil(electricity) || electricity > 40) {
      return
    }
    // 低电量
    if (electricity > 20) {
      return '#F29D49'
    }
    // 严重低电量
    return '#DD4444'
  }, [electricity])

  return (
    <I
      l={<IconBattery />}
      v={<span style={{ color: eleColor }}>{electricity ?? '-'} %</span>}
      t={t('common.electricity')}
    />
  )
})

const HorizontalSpeed = memo(() => {
  const { t } = useTranslation()
  const horizontalSpeed = useS((s) => s.state?.horizontalSpeed)
  return (
    <I
      t={t('controlRoom.uav.header.hSpeed.title')}
      l={'H.S'}
      v={<span>{horizontalSpeed?.toFixed(1) ?? '-'} m/s</span>}
    />
  )
})

const Height = memo(() => {
  const { t } = useTranslation()
  const height = useS((s) => s.state?.height)
  return (
    <I
      t={t('common.height')}
      l={'ALT'}
      v={<span>{height?.toFixed(1) ?? '-'} m</span>}
    />
  )
})

const Altitude = memo(() => {
  const { t } = useTranslation()
  const altitude = useS((s) => s.state?.altitude)
  return (
    <I
      t={t('controlRoom.uav.header.altitude.title')}
      l={'ASL'}
      v={<span>{altitude?.toFixed(1) ?? '-'} m</span>}
    />
  )
})

const HomeDistance = memo(() => {
  const { t } = useTranslation()
  const homeDistance = useS((s) => s.state?.homeDistance)
  return (
    <I
      t={t('controlRoom.uav.header.distanceFromHome.title')}
      l={<IconHome className="text-orange-400" />}
      v={<span>{homeDistance?.toFixed(1) ?? '-'} m</span>}
    />
  )
})

const FT = memo(() => {
  const { t } = useTranslation()
  const flyTime = useS((s) => s.state?.flyTime)
  const ft = useMemo(() => {
    if (!flyTime) {
      return t('controlRoom.uav.header.ft.untaken')
    }
    if (flyTime < 60) {
      return '< 1 min'
    }
    return `${(flyTime / (60 * 1000)).toFixed(0)} min`
  }, [flyTime, t])

  return (
    <I
      t={t('controlRoom.uav.header.ft.title')}
      l={'FT'}
      v={<span>{ft ?? '-'}</span>}
    />
  )
})

const FD = memo(() => {
  const { t } = useTranslation()
  const flyDistance = useS((s) => s.state?.flyDistance)
  return (
    <I
      t={t('controlRoom.uav.header.fd.title')}
      l={'FD'}
      v={<span>{flyDistance?.toFixed(1) ?? '-'} m</span>}
    />
  )
})

const DebugState = memo(() => {
  const { t } = useTranslation()
  const state = useS((s) => s.state)

  return (
    <I
      t={t('common.debug')}
      l={null}
      v={
        <IconButtonWithDropDownDialog
          title={t('common.debug')}
          trigger={['click']}
          useDing
          autoAdjustOverflow
          tooltipProps={{
            title: t('common.debug'),
          }}
          destroyPopupOnHide
          dropdownRender={() => (
            <ScrollArea className="max-h-[80vh] text-xs">
              <pre>
                <code>{JSON.stringify(state, null, 2)}</code>
              </pre>
            </ScrollArea>
          )}
        >
          <BugOutlined />
        </IconButtonWithDropDownDialog>
      }
    />
  )
})

const ControlRoomUavHeader: FC = memo(() => {
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const appHeader = document.getElementById('app-header-center')

  const updateLinks = useUavControlRoomStore((s) => s.updateLinks)

  const h = (
    <header className="flex justify-between items-center text-sm px-3">
      {appHeader ? <HeaderLeft /> : <div />}
      <ScrollArea className="w-full h-full flex items-center ml-3">
        <div className="flex items-center gap-3">
          <section className="grow">
            <ul className="flex justify-center gap-1 xl:gap-3 2xl:gap-5 whitespace-nowrap">
              <DeviceLinkSwitch
                productKey={productKey}
                deviceId={deviceId}
                className="text-fore"
                onLinksChange={updateLinks}
              />
              <Signal14G />
              <SDRStrength />
              <SignalStrength />
              <SatelliteNumber />
              <Battery />
              <HorizontalSpeed />
              <Height />
              <Altitude />
              <HomeDistance />
              <FT />
              <FD />
              <DebugState />
            </ul>
          </section>
          <section>
            <LatestTask deviceId={deviceId} />
          </section>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </header>
  )

  if (appHeader) {
    return createPortal(h, appHeader)
  }

  return <div className="bg-ground-3 mx-2 rounded mt-2">{h}</div>
})

ControlRoomUavHeader.displayName = 'ControlRoomUavHeader'

export default ControlRoomUavHeader
