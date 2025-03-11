import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { BillboardCollection, LabelCollection } from 'resium'
import UavMarker from './UavMarker'
import UavDetailMarker from './UavDetailMarker'

type PropsType = unknown

const UavMarkers: FC<PropsType> = memo(() => {
  const uavDevices = useMapDevicesStore((s) => s.uavDevices)

  return (
    <>
      <BillboardCollection>
        <LabelCollection>
          {uavDevices.map((e) => (
            <UavMarker key={e.deviceId} data={e} />
          ))}
        </LabelCollection>
      </BillboardCollection>
      <UavDetailMarker />
    </>
  )
})

UavMarkers.displayName = 'UavMarkers'

export default UavMarkers
