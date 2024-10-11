import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { memo, type FC } from 'react'
import { BillboardCollection, LabelCollection } from 'resium'
import UavAirportMarker from './UavAirportMarker'

type PropsType = unknown

const UavAirportMarkers: FC<PropsType> = memo(() => {
  const airportDevices = useMapDevicesStore((s) => s.airportDevices)

  return (
    <BillboardCollection>
      <LabelCollection>
        {airportDevices.map((e) => (
          <UavAirportMarker key={e.deviceId} data={e} />
        ))}
      </LabelCollection>
    </BillboardCollection>
  )
})

UavAirportMarkers.displayName = 'UavAirportMarkers'

export default UavAirportMarkers
