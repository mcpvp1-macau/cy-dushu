import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { BillboardCollection, LabelCollection } from 'resium'
import { useShallow } from 'zustand/react/shallow'
import UavMarkerWrapper from './UavMarkerWrapper'

type PropsType = unknown

const UavMarkers: FC<PropsType> = memo(() => {
  const uavDevices = useMapDevicesStore((s) => s.uavDevices)
  const uavStates = useMapDevicesStore(
    useShallow((s) => Object.keys(s.uavStates)),
  )
  const uavDetailSet = useMemo(() => new Set(uavStates), [uavStates])

  return (
    <>
      <BillboardCollection>
        <LabelCollection>
          {uavDevices.map((e) => (
            <UavMarkerWrapper
              key={e.deviceId}
              data={e}
              isDetail={uavDetailSet.has(e.deviceId)}
            />
          ))}
        </LabelCollection>
      </BillboardCollection>
    </>
  )
})

UavMarkers.displayName = 'UavMarkers'

export default UavMarkers
