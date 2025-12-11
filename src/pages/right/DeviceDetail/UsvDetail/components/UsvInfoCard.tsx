import { StatusColorMap } from '@/enum/device'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1 leading-5 text-sm">
      <div className="whitespace-nowrap">{l}:</div>
      <span className="text-hightlight">{v}</span>
    </li>
  )
}

type PropsType = Partial<{
  modelNumber: string
  onlineStatus: string
  electricity: number
  longitude: number
  latitude: number
  heading: number
  speed: number
}>

const UsvInfoCard: FC<PropsType> = memo(
  ({ modelNumber, onlineStatus, electricity, longitude, latitude, heading, speed }) => {
    const { t } = useTranslation()
    const headingLabel = t('device.heading', { defaultValue: '艏向' })

    const formatNumber = (value: number | undefined, fractionDigits = 2) => {
      if (value === undefined || value === null || Number.isNaN(value)) return '-'
      return Number(value).toFixed(fractionDigits)
    }

    return (
      <ul className="p-2 mx-3 mr-[9px] card-border text-sm flex flex-wrap">
        <I l={t('common.modelNumber')} v={modelNumber || '-'} />
        <I
          l={t('common.onlineStatus')}
          v={
            <span style={{ color: onlineStatus ? StatusColorMap[onlineStatus] : undefined }}>
              {onlineStatus ? t(`device.status.online.${onlineStatus}`) : '-'}
            </span>
          }
        />
        <I l={t('common.electricity')} v={`${electricity ?? '-'} %`} />
        <I l={t('common.longitude')} v={formatNumber(longitude, 5)} />
        <I l={t('common.latitude')} v={formatNumber(latitude, 5)} />
        <I l={t('common.speed')} v={`${formatNumber(speed)} m/s`} />
        <I l={headingLabel} v={`${formatNumber(heading, 1)} °`} />
      </ul>
    )
  },
)

UsvInfoCard.displayName = 'UsvInfoCard'

export default UsvInfoCard
