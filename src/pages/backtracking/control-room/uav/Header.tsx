import { createPortal } from 'react-dom'
import IconBack from '@/assets/icons/jsx/IconBack'
import IconBattery from '@/assets/icons/jsx/IconBattery'
import IconSatellite from '@/assets/icons/jsx/IconSatellite'
import IconHome from '@/assets/icons/jsx/uav/IconHome'
import SignalStrengthIcon from '@/components/device/SignalStrength'
import IconButton from '@/components/ui/button/IconButton'
import React from 'react'
import { useTitle } from 'ahooks'
import { Tooltip } from 'antd'
import { isNil } from 'lodash'
import JCXT from '@/pages/right/DeviceDetail/UavAirportDetail/components/RemoteDebug/icons/JCXT'
import useBackTrackingInfo from '../../hooks/useBackTrackingInfo'
import { shouldJson } from '@/utils/json'

// const DeviceLinkSwitch = lazy(
//   () => import('@/components/device/DeviceLinkSwitch'),
// )

type Left = {
  deviceName: string
}

type PropsValueType = {
  value: number
}

const HeaderLeft: React.FC<Left> = memo(({ deviceName }) => {
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

const I: FC<{ l: ReactNode; v: ReactNode; t?: string }> = ({ l, v, t }) => {
  if (globalConfig.controlRoom?.uav?.particularHeader) {
    return (
      <li className="flex gap-1 select-none">
        {t && `${t} `}
        {v}
      </li>
    )
  }
  return (
    <li className="flex gap-1 select-none">
      {t ? <Tooltip title={t}>{l}</Tooltip> : <div>{l}</div>}
      <div>{v}</div>
    </li>
  )
}

const Signal14G: React.FC<{ value: { type: string; sqe: number }[] }> = memo(
  ({ value }) => {
    const { t } = useTranslation()
    const signal = value
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
  },
)

const SDRStrength: React.FC<PropsValueType> = memo(({ value }) => {
  const { t } = useTranslation()
  const sdrStrength = value
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

const SignalStrength: React.FC<{
  signalMode: string
  signalStrength: number
}> = memo(({ signalMode, signalStrength }) => {
  const { t } = useTranslation()
  return (
    <I
      t={(signalMode || '4G') + t('controlRoom.uav.header.signal.title')}
      l={signalMode || '4G'}
      v={<SignalStrengthIcon value={signalStrength ?? -1} max={5} />}
    />
  )
})

const SatelliteNumber: React.FC<PropsValueType> = memo(({ value }) => {
  const satelliteNumber = value
  return <I l={<IconSatellite />} v={satelliteNumber ?? '-'} />
})

const Battery: React.FC<PropsValueType> = memo(({ value }) => {
  const { t } = useTranslation()
  const electricity = value

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

const HorizontalSpeed: React.FC<PropsValueType> = memo(({ value }) => {
  const { t } = useTranslation()
  const horizontalSpeed = value
  return (
    <I
      t={t('controlRoom.uav.header.hSpeed.title')}
      l={'H.S'}
      v={<span>{horizontalSpeed?.toFixed(1) ?? '-'} m/s</span>}
    />
  )
})

const Height: React.FC<PropsValueType> = memo(({ value }) => {
  const { t } = useTranslation()
  const height = value
  return (
    <I
      t={t('common.height')}
      l={'ATL'}
      v={<span>{height?.toFixed(1) ?? '-'} m</span>}
    />
  )
})

const Altitude: React.FC<PropsValueType> = memo(({ value }) => {
  const { t } = useTranslation()
  const altitude = value
  return (
    <I
      t={t('controlRoom.uav.header.altitude.title')}
      l={'ASL'}
      v={<span>{altitude?.toFixed(1) ?? '-'} m</span>}
    />
  )
})

const HomeDistance: React.FC<PropsValueType> = memo(({ value }) => {
  const { t } = useTranslation()
  const homeDistance = Number(value)
  return (
    <I
      t={t('controlRoom.uav.header.distanceFromHome.title')}
      l={<IconHome className="text-orange-400" />}
      v={<span>{homeDistance?.toFixed(1) ?? '-'} m</span>}
    />
  )
})

const FT: React.FC<PropsValueType> = memo(({ value }) => {
  const { t } = useTranslation()
  const flyTime = Number(value)
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

const FD: React.FC<PropsValueType> = memo(({ value }) => {
  const { t } = useTranslation()
  const flyDistance = Number(value)
  return (
    <I
      t={t('controlRoom.uav.header.fd.title')}
      l={'FD'}
      v={<span>{flyDistance?.toFixed(1) ?? '-'} m</span>}
    />
  )
})

type PropsType = {
  productKey: string
  deviceId: string
  deviceName: string
}
const Header: React.FC<PropsType> = memo(({ deviceId, deviceName }) => {
  const appHeader = document.getElementById('app-header-center')

  const curAttr = useBackTrackingInfo(deviceId)

  const properties = useMemo(() => {
    return shouldJson(curAttr?.properties)?.[deviceId]
  }, [deviceId, curAttr?.properties])

  const h = (
    <header className="h-7 flex justify-between gap-3 px-3 items-center text-sm">
      {appHeader ? <HeaderLeft deviceName={deviceName} /> : <div />}
      <section className="grow">
        <ul className="flex justify-center gap-1 xl:gap-3 2xl:gap-5 whitespace-nowrap">
          {/* <DeviceLinkSwitch
              productKey={productKey}
              deviceId={deviceId}
              className="text-fore"
            /> */}
          <Signal14G value={properties?.signal} />
          <SDRStrength value={properties?.sdrStrength} />
          <SignalStrength
            signalMode={properties?.signalMode}
            signalStrength={properties?.signalStrength}
          />
          <SatelliteNumber value={properties?.satelliteNumber} />
          <Battery value={properties?.electricity} />
          <HorizontalSpeed value={properties?.horizontalSpeed} />
          <Height value={properties?.height} />
          <Altitude value={properties?.altitude} />
          <HomeDistance value={properties?.homeDistance} />
          <FT value={properties?.flyTime} />
          <FD value={properties?.flyDistance} />
        </ul>
      </section>
      <section>{/* <LatestTask deviceId={deviceId} /> */}</section>
    </header>
  )

  if (appHeader) {
    return createPortal(h, appHeader)
  }

  return <div className="bg-ground-3 mx-2 rounded mt-2">{h}</div>
})

export default Header
