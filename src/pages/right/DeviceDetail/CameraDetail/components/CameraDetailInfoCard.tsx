import DeviceOnlineStatus from '@/components/device/OnlineStatus'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1">
      <div>{l}:</div>
      {v}
    </li>
  )
}

type PropsType = {
  modelNumber: string
  onlineStatus: string
  longitude?: number
  latitude?: number
}

const CameraDetailInfoCard: FC<PropsType> = memo(
  ({ modelNumber, onlineStatus, longitude, latitude }) => {
    const { t } = useTranslation()
    return (
      <ul className="flex flex-wrap text-sm card-border p-3">
        <I l={t('common.modelNumber')} v={modelNumber || '-'} />
        <I l={t('common.onlineStatus')} v={<DeviceOnlineStatus status={onlineStatus} />} />
        <I l={t('common.longitude')} v={longitude ?? '-'} />
        <I l={t('common.latitude')} v={latitude ?? '-'} />
      </ul>
    )
  },
)

CameraDetailInfoCard.displayName = 'CameraDetailInfoCard'

export default CameraDetailInfoCard
