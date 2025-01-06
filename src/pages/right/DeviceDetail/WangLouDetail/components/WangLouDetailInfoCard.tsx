import DeviceOnlineStatus from '@/components/device/OnlineStatus'
import { memo, type FC } from 'react'

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

const WangLouDetailInfoCard: FC<PropsType> = memo(
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

WangLouDetailInfoCard.displayName = 'WangLouDetailInfoCard'

export default WangLouDetailInfoCard
