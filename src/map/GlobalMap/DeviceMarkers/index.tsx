import { memo, type FC } from 'react'
import UavMarkers from './UavMarkers'
import UavAirportMarkers from './UavAirportMarkers'

type PropsType = unknown

const DeviceMarkers: FC<PropsType> = memo(() => {
  return (
    <>
      {/* 无人机 */}
      <UavMarkers />
      {/* 无人机机库 */}
      <UavAirportMarkers />
    </>
  )
})

DeviceMarkers.displayName = 'DeviceMarkers'

export default DeviceMarkers
