import { memo, type FC } from 'react'
import UavMarkers from './UavMarkers'
import UavAirportMarkers from './UavAirportMarkers'
import OtherMarkers from './OtherMarkers'
import WangLouMarkers from './WangLouMarkers'
import RebotDogMarkers from './RebotDogMarkers'

type PropsType = unknown

const DeviceMarkers: FC<PropsType> = memo(() => {
  return (
    <>
      {/* 无人机 */}
      <UavMarkers />
      {/* 无人机机库 */}
      <UavAirportMarkers />
      {/** 望楼 */}
      <WangLouMarkers />
      {/** 机器狗 */}
      <RebotDogMarkers />
      {/** 一般设备 */}
      <OtherMarkers />
    </>
  )
})

DeviceMarkers.displayName = 'DeviceMarkers'

export default DeviceMarkers
