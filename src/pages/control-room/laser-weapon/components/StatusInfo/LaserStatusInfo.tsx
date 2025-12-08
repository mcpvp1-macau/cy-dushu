import {FC, memo} from 'react'

type PropsType = {}

const LaserStatusInfo: FC<PropsType> = memo(() => {
  return (
    <ul className="flex flex-wrap text-sm card-border px-1 p-1 bg-[#28323C] m-2">
      <InfoItem name="laserDevicePresenceStatus" label="激光存在" />
      <InfoItem name="laserDeviceWorkingStatus" label="激光状态" />
    </ul>
  )
})

LaserStatusInfo.displayName = 'LaserStatusInfo'

export default LaserStatusInfo
