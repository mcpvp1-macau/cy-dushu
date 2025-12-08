import SignalStrength from '@/components/device/SignalStrength'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1">
      <div className="whitespace-nowrap">{l}:</div>
      <p className="whitespace-nowrap truncate">{v}</p>
    </li>
  )
}

type PropsType = Record<string, never> & Partial<{
  operator: string
  signalStrength: number
  displayMode: string
  electricity: number
  longitude: number
  latitude: number
  height: number
  horizontalSpeed: number
}>

const UavDetailInfoCard: FC<PropsType> = memo(
  ({
    operator,
    signalStrength,
    displayMode,
    electricity,
    longitude,
    latitude,
    height,
    horizontalSpeed,
  }) => {
    return (
      <ul className="p-2 mx-3 mr-[9px] card-border text-sm flex flex-wrap">
        <I l="操作者" v={operator || '-'} />
        <I l="信号" v={<SignalStrength value={signalStrength ?? 0} />} />
        <I l="飞行状态" v={displayMode} />
        <I l="电量" v={`${electricity || 0} %`} />
        <I l="经度" v={longitude?.toFixed(5) || '-'} />
        <I l="纬度" v={latitude?.toFixed(5) || '-'} />
        <I l="高度" v={`${height?.toFixed(2) || 0} m`} />
        <I l="速度" v={`${horizontalSpeed?.toFixed(2) || 0} m/s`} />
      </ul>
    )
  },
)

UavDetailInfoCard.displayName = 'UavDetailInfoCard'

export default UavDetailInfoCard
