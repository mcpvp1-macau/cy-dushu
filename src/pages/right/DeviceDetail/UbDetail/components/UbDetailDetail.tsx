import UbInfoCard from './UbInfoCard'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'

const UbDetailDetail: FC = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const modelNumber =
    deviceDetail?.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'

  const properties = deviceDetail?.properties ?? {}

  const onlineStatus = useRealOnlineStatus(deviceId)

  const longitude = properties.longitude ?? deviceDetail?.longitude
  const latitude = properties.latitude ?? deviceDetail?.latitude
  const heading = properties.heading ?? properties.course
  const speed = properties.speed
  const electricity = properties.batteryPercentage

  return (
    <div className="pt-3 pb-4">
      <UbInfoCard
        modelNumber={modelNumber}
        onlineStatus={onlineStatus}
        electricity={electricity}
        longitude={longitude}
        latitude={latitude}
        heading={heading}
        speed={speed}
      />
    </div>
  )
})

UbDetailDetail.displayName = 'UbDetailDetail'

export default UbDetailDetail
