import { StatusColorMap } from '@/enum/device'
import useConfig from '@/pages/control-room/wanglou/components/StatusInfo/useConfig'
import { memo, type FC } from 'react'

type PropsType = {
  status: string
}

const DeviceOnlineStatus: FC<PropsType> = memo(({ status }) => {
  const { StatusMap } = useConfig()
  return (
    <span style={{ color: StatusColorMap[status] }}>{StatusMap[status]}</span>
  )
})

DeviceOnlineStatus.displayName = 'onlineStatus'

export default DeviceOnlineStatus
