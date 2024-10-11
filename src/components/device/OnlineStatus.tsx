import { StatusColorMap, StatusMap } from '@/enum/device'
import { memo, type FC } from 'react'

type PropsType = {
  status: string
}

const DeviceOnlineStatus: FC<PropsType> = memo(({ status }) => {
  return (
    <span style={{ color: StatusColorMap[status] }}>{StatusMap[status]}</span>
  )
})

DeviceOnlineStatus.displayName = 'onlineStatus'

export default DeviceOnlineStatus
