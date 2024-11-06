import DeviceIconUAV from '@/assets/icons/jsx/device/DeviceIconUAV'
import { memo, type FC } from 'react'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const UavBackTrackingDetail: FC<PropsType> = memo(({ data }) => {
  return (
    <div className="w-[350px]">
      <div className="flex justify-between px-3 py-2">
        <div className="flex gap-2 items-center">
          <DeviceIconUAV className="device-detail-icon" />
          <h6 className="text-white text-base">{data.deviceName}</h6>
        </div>
      </div>
    </div>
  )
})

UavBackTrackingDetail.displayName = 'UavBackTrackingDetail'

export default UavBackTrackingDetail
