import IconBack from '@/assets/icons/jsx/IconBack'
import IconBattery from '@/assets/icons/jsx/IconBattery'
import IconSatellite from '@/assets/icons/jsx/IconSatellite'
import IconHome from '@/assets/icons/jsx/uav/IconHome'
import SignalStrengthIcon from '@/components/device/SignalStrength'
import IconButton from '@/components/ui/button/IconButton'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import JCXT from '@/pages/right/DeviceDetail/UavAirportDetail/components/RemoteDebug/icons/JCXT'
import { useUavControlRoomStore as useS } from '@/store/context-store/useUavControlRoom.store'
import { Tooltip } from 'antd'
import { isNil } from 'lodash'
import { lazy } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

const DeviceLinkSwitch = lazy(
  () => import('@/components/device/DeviceLinkSwitch'),
)

const HeaderLeft = memo(() => {
  const deviceName = useDeviceDetailStore((s) => s.deviceDetail?.deviceName)
  const navigate = useNavigate()

  return (
    <section className="flex items-center gap-3">
      <IconButton className="text-base" onClick={() => navigate(-1)}>
        <IconBack />
      </IconButton>
      <h3 className="whitespace-nowrap">{deviceName}</h3>
    </section>
  )
})

const I: FC<{ l: ReactNode; v: ReactNode; t?: string }> = ({ l, v, t }) => (
  <li className="flex gap-1 select-none">
    {t ? <Tooltip title={t}>{l}</Tooltip> : <div>{l}</div>}
    <div>{v}</div>
  </li>
)

const SDRStrength = memo(() => {
  const sdrStrength = useS((s) => s.state?.sdrStrength)
  if (isNil(sdrStrength)) {
    return null
  }
  return (
    <I
      t={'无线电信号强度'}
      l={<JCXT />}
      v={<SignalStrengthIcon value={sdrStrength ?? -1} max={5} />}
    ></I>
  )
})

const SignalStrength = memo(() => {
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
      t="信号强度"
      l={signalMode || '4G'}
      v={<SignalStrengthIcon value={signalStrength ?? -1} max={5} />}
    />
  )
})

const SatelliteNumber = memo(() => {
  const satelliteNumber = useS((s) => s.state?.satelliteNumber)
  return <I l={<IconSatellite />} v={satelliteNumber ?? '-'} />
})

const Battery = memo(() => {
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
    />
  )
})

const HorizontalSpeed = memo(() => {
  const horizontalSpeed = useS((s) => s.state?.horizontalSpeed)
  return (
    <I
      t={'水平速度'}
      l={'H.S'}
      v={<span>{horizontalSpeed?.toFixed(1) ?? '-'} m/s</span>}
    />
  )
})

const Height = memo(() => {
  const height = useS((s) => s.state?.height)
  return (
    <I t={'高度'} l={'AGL'} v={<span>{height?.toFixed(1) ?? '-'} m</span>} />
  )
})

const Altitude = memo(() => {
  const altitude = useS((s) => s.state?.altitude)
  return (
    <I t={'海拔'} l={'ASL'} v={<span>{altitude?.toFixed(1) ?? '-'} m</span>} />
  )
})

const HomeDistance = memo(() => {
  const homeDistance = useS((s) => s.state?.homeDistance)
  return (
    <I
      t={'距离起飞点'}
      l={<IconHome className="text-orange-400" />}
      v={<span>{homeDistance?.toFixed(1) ?? '-'} m</span>}
    />
  )
})

const FT = memo(() => {
  const flyTime = useS((s) => s.state?.flyTime)
  const ft = useMemo(() => {
    if (!flyTime) {
      return '未起飞'
    }
    if (flyTime < 60) {
      return '< 1 min'
    }
    return `${(flyTime / (60 * 1000)).toFixed(0)} min`
  }, [flyTime])

  return <I t={'飞行时间'} l={'FT'} v={<span>{ft ?? '-'}</span>} />
})

const FD = memo(() => {
  const flyDistance = useS((s) => s.state?.flyDistance)
  return (
    <I
      t={'飞行距离'}
      l={'FD'}
      v={<span>{flyDistance?.toFixed(1) ?? '-'} m</span>}
    />
  )
})

const ControlRoomUavHeader: FC = memo(() => {
  const [searchParams] = useSearchParams()
  const useLW = searchParams.get('useLW')
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  return (
    <header className="h-7 flex justify-between gap-3 bg-ground-100 px-3 items-center text-sm">
      <HeaderLeft />
      <section className="grow">
        <ul className="flex justify-center gap-3 lg:gap-5 whitespace-nowrap">
          {useLW && (
            <DeviceLinkSwitch
              productKey={productKey}
              deviceId={deviceId}
              className="text-fore"
            />
          )}
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
        </ul>
      </section>
      <section />
    </header>
  )
})

ControlRoomUavHeader.displayName = 'ControlRoomUavHeader'

export default ControlRoomUavHeader
