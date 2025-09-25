import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { memo, type FC } from 'react'
import { BillboardCollection, LabelCollection } from 'resium'
import OtherMarker from './OtherMarker'

type PropsType = unknown

const OtherMarkers: FC<PropsType> = memo(() => {
  const otherDevices = useMapDevicesStore((s) => s.otherDevices)
  console.info(otherDevices)
  return (
    <>
      <BillboardCollection>
        <LabelCollection>
          {otherDevices.map((e) => (
            <OtherMarker key={e.deviceId} data={e} />
          ))}
        </LabelCollection>
      </BillboardCollection>
    </>
  )
})

OtherMarkers.displayName = 'OtherMarkers'

export default OtherMarkers
