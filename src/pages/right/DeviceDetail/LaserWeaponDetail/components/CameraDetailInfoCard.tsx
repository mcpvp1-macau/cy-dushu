import DeviceOnlineStatus from '@/components/device/OnlineStatus'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1 text-sm items-center">
      <div className='text-xs text-fore'>{l}:</div>
      {v}
    </li>
  )
}

type PropsType = {
  modelNumber: string
  onlineStatus: string
  longitude?: number
  latitude?: number
  altitude?: number
}

const CameraDetailInfoCard: FC<PropsType> = memo(
  ({ modelNumber, onlineStatus, longitude, latitude, altitude }) => {
    const { t } = useTranslation()
    return (
      <ul className="flex flex-wrap text-sm card-border p-3">
        <I l={'设备型号'} v={modelNumber || '-'} />
        <I l={t('common.onlineStatus')} v={<DeviceOnlineStatus status={onlineStatus} />} />
        <I l={'设备经度'} v={longitude ?? '-'} />
        <I l={'设备纬度'} v={latitude ?? '-'} />
        <I l={'设备高度'} v={altitude ?? '-'} />
      </ul>
    )
  },
)

CameraDetailInfoCard.displayName = 'CameraDetailInfoCard'

export default CameraDetailInfoCard
