import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { BillboardCollection, LabelCollection } from 'resium'
import RebotDogMarker from './RebotDogMarker'

type PropsType = unknown

const RebotDogMarkers: FC<PropsType> = memo(() => {
  const robotDogDevices = useMapDevicesStore((s) => s.robotDogDevices)

  return (
    <>
      <BillboardCollection>
        <LabelCollection>
          {robotDogDevices.map((e) => (
            <RebotDogMarker key={e.deviceId} data={e} />
          ))}
        </LabelCollection>
      </BillboardCollection>
    </>
  )
})

RebotDogMarkers.displayName = 'RebotDogMarkers'

export default RebotDogMarkers
