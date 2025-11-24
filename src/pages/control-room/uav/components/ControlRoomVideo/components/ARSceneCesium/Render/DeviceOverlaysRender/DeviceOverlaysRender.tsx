import { DeviceEnum } from '@/enum/device'
import OtherMarker from '@/map/GlobalMap/DeviceMarkers/OtherMarkers/OtherMarker'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { BillboardCollection, LabelCollection } from 'resium'

type PropsType = unknown

const DeviceOverlaysRender: FC<PropsType> = memo(() => {
  const allDevices = useMapDevicesStore((s) =>
    s.allDevices.filter((e) =>
      [DeviceEnum.SITE_ENFORCEMENT_RECORDER, DeviceEnum['DUSHU-MB']].includes(
        e.deviceType as DeviceEnum,
      ),
    ),
  )

  return (
    <BillboardCollection>
      <LabelCollection>
        {allDevices.map((e) => (
          <OtherMarker key={e.deviceId} data={e} />
        ))}
      </LabelCollection>
    </BillboardCollection>
  )
})

DeviceOverlaysRender.displayName = 'DeviceOverlaysRender'

export default DeviceOverlaysRender
