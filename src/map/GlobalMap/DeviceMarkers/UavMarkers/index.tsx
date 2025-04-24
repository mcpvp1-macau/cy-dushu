import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { BillboardCollection, LabelCollection } from 'resium'
import UavMarker from './UavMarker'
import UavDetailMarker from './UavDetailMarker'
import { useShallow } from 'zustand/react/shallow'

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
          {uavDevices.map((e) => {
            if (uavDetailSet.has(e.deviceId)) {
              return <UavDetailMarker key={e.deviceId} deviceId={e.deviceId} />
            }
            return <UavMarker key={e.deviceId} data={e} />
          })}
        </LabelCollection>
      </BillboardCollection>
    </>
  )
})

UavMarkers.displayName = 'UavMarkers'

export default UavMarkers
