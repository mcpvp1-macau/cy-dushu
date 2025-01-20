import SignalStrength from '@/components/device/SignalStrength'
import { uavDisplayModeTransMap } from '@/constant/trans_map/uav_display_mode'
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
  displayMode: string
  electricity: number
  longitude: number
  latitude: number
  height: number
  horizontalSpeed: number
}>

const UavDetailInfoCard: FC<PropsType> = memo(
  ({
    modelNumber,
    onlineStatus,
    signalStrength,
    displayMode,
    electricity,
    longitude,
    latitude,
    height,
    horizontalSpeed,
  }) => {
    const { t, i18n } = useTranslation()

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
        <I
          l={t('uav.displayMode.title')}
          v={
            uavDisplayModeTransMap[displayMode || '']?.[i18n.language] ||
            displayMode
          }
        />
        <I l={t('common.electricity')} v={`${electricity || 0} %`} />
        <I l={t('common.longitude')} v={longitude?.toFixed(5) || '-'} />
        <I l={t('common.latitude')} v={latitude?.toFixed(5) || '-'} />
        <I l={t('common.height')} v={`${height?.toFixed(2) || 0} m`} />
        <I
          l={t('common.speed')}
          v={`${horizontalSpeed?.toFixed(2) || 0} m/s`}
        />
      </ul>
    )
  },
)

UavDetailInfoCard.displayName = 'UavDetailInfoCard'

export default UavDetailInfoCard
