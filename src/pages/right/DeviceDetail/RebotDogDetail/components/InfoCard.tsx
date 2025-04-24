import SignalStrength from '@/components/device/SignalStrength'
import { StatusColorMap } from '@/enum/device'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1">
      <div className="whitespace-nowrap">{l}:</div>
      {v}
    </li>
  )
}

type PropsType = {} & Partial<{
  modelNumber: string
  onlineStatus: string
  signalStrength: number
  longitude: number
  latitude: number
  electricity: number
  speed: number
}>

const RebotDogInfoCard: FC<PropsType> = memo(
  ({
    modelNumber,
    onlineStatus,
    signalStrength,
    longitude,
    latitude,
    electricity,
    speed,
  }) => {
    const { t } = useTranslation()

    return (
      <ul className="p-2 mx-3 mr-[9px] card-border text-sm flex flex-wrap">
        <I l={t('common.modelNumber')} v={modelNumber} />
        <I
          l={t('common.onlineStatus')}
          v={
            <p className="flex gap-2">
              <span style={{ color: StatusColorMap[onlineStatus!] }}>
                {onlineStatus ? t(`device.status.online.${onlineStatus}`) : '-'}
              </span>
              <SignalStrength value={signalStrength ?? 0} />
            </p>
          }
        />
        <I l={t('common.electricity')} v={`${electricity || '-'} %`} />
        <I l={t('common.speed')} v={`${speed?.toFixed(2) || '-'} m/s`} />
        <I l={t('common.longitude')} v={longitude?.toFixed(5) || '-'} />
        <I l={t('common.latitude')} v={latitude?.toFixed(5) || '-'} />
      </ul>
    )
  },
)

RebotDogInfoCard.displayName = 'RebotDogInfoCard'

export default RebotDogInfoCard
