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
    return (
      <ul className="flex flex-wrap text-sm card-border p-3">
        <I l="型号" v={modelNumber || '-'} />
        <I l="在线状态" v={<DeviceOnlineStatus status={onlineStatus} />} />
        <I l="经度" v={longitude ?? '-'} />
        <I l="纬度" v={latitude ?? '-'} />
      </ul>
    )
  },
)

CameraDetailInfoCard.displayName = 'CameraDetailInfoCard'

export default CameraDetailInfoCard
