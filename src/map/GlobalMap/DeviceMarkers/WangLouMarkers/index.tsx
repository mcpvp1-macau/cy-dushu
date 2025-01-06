import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { memo, type FC } from 'react'
import { BillboardCollection, LabelCollection } from 'resium'
import WangLouMarker from './WangLouMarker'
import WangLouDetailMarker from './WangLouDetailMarker'

type PropsType = unknown

const WangLouMarkers: FC<PropsType> = memo(() => {
  const wangloutDevices = useMapDevicesStore((s) => s.wangloutDevices)

  return (
    <>
      <BillboardCollection>
        <LabelCollection>
          {wangloutDevices.map((e) => (
            <WangLouMarker key={e.deviceId} data={e} />
          ))}
        </LabelCollection>
      </BillboardCollection>
      <WangLouDetailMarker />
    </>
  )
})

WangLouMarkers.displayName = 'WangLouMarkers'

export default WangLouMarkers
