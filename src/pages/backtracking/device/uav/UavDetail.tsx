import DeviceIconUAV from '@/assets/icons/jsx/device/DeviceIconUAV'
import { memo, type FC } from 'react'
import UavDetailInfoCard from './InfoCard'
import HealthInfoMini from '@/components/device/HealthInfoMini'

type PropsType = {
  data: API_DEVICE.domain.Device
  state: Record<string, any>
  updateTime: string
}

const UavBackTrackingDetail: FC<PropsType> = memo(
  ({ data, state, updateTime }) => {
    return (
      <div className="w-[350px]">
        <div className="flex justify-between px-3 my-2">
          <div className="flex gap-2 items-center">
            <DeviceIconUAV className="device-detail-icon" />
            <h6 className="text-white text-base">{data.deviceName}</h6>
            {state.healthInfo?.length > 0 && (
              <HealthInfoMini healthInfo={state.healthInfo} />
            )}
          </div>
        </div>
        <div className="my-2">
          <UavDetailInfoCard
            operator={state.operator}
            signalStrength={state.signalStrength}
            displayMode={state.displayMode}
            electricity={state.electricity}
            longitude={state.longitude}
            latitude={state.latitude}
            height={state.height}
            horizontalSpeed={state.horizontalSpeed}
          />
        </div>
        <div className="my-2 px-3 text-xs text-center">
          数据时间: {updateTime}
        </div>
      </div>
    )
  },
)

UavBackTrackingDetail.displayName = 'UavBackTrackingDetail'

export default UavBackTrackingDetail
