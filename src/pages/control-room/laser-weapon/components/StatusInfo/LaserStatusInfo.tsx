import { FC, memo, ReactNode } from 'react'

import InfoItem, { I } from './InfoItem'

type PropsType = {}

const LaserStatusInfo: FC<PropsType> = memo(() => {
  return (
    <ul className="flex flex-wrap text-sm card-border p-3">
      <InfoItem name="laserDevicePresenceStatus" label="激光存在" />
      <InfoItem name="laserDeviceWorkingStatus" label="激光状态" />
    </ul>
  )
})

LaserStatusInfo.displayName = 'LaserStatusInfo'

export default LaserStatusInfo
