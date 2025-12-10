import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import UsvInfoCard from './UsvInfoCard'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import VideoSnapshotBtn from '@/hooks/device/VideoSnapshot'
import useWebSocket from 'react-use-websocket'
import { heartbeat } from '@/constant/websocket'
import { shouldJson } from '@/utils/json'
import useDeviceWsURL from '@/hooks/device/useDeviceWsURL'
import { ComponentRef } from 'react'

const UsvDetailDetail: FC = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const productKey = useDeviceDetailStore((s) => s.productKey)

  const videoRef = useRef<ComponentRef<typeof DeviceLiveVideo>>(null)
  const [properties, setProperties] = useState<Record<string, any>>(
    deviceDetail?.properties ?? {},
  )

  const videoId = properties.videoList?.[0]?.videoId ?? ''

  const modelNumber =
    deviceDetail?.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'

  const onlineStatus = useRealOnlineStatus(deviceId)

  const longitude = properties.longitude ?? deviceDetail?.longitude
  const latitude = properties.latitude ?? deviceDetail?.latitude
  const heading = properties.heading ?? properties.course
  const speed = properties.speed
  const electricity = properties.batteryPercentage

  const wsUrl = useDeviceWsURL(productKey, deviceId)

  const handleMessage = useMemoizedFn(
    (evt: WebSocketEventMap['message']) => {
      const wsData = shouldJson(evt.data)
      if (!wsData) return
      if (
        ['event.property.post', 'properties.state'].includes(wsData.method) &&
        wsData.deviceId === deviceId
      ) {
        setProperties((prev) => ({ ...prev, ...wsData.data }))
      }
    },
  )

  useWebSocket(wsUrl, {
    heartbeat,
    reconnectAttempts: 0x3f3f3f3f,
    retryOnError: true,
    reconnectInterval: 5_000,
    shouldReconnect: () => true,
    onMessage: handleMessage,
  })

  useEffect(() => {
    setProperties(deviceDetail?.properties ?? {})
  }, [deviceDetail?.properties])

  return (
    <div>
      <UsvInfoCard
        modelNumber={modelNumber}
        onlineStatus={onlineStatus}
        electricity={electricity}
        longitude={longitude}
        latitude={latitude}
        heading={heading}
        speed={speed}
      />
      <div className="m-3">
        <DeviceLiveVideo
          ref={videoRef}
          productKey={productKey}
          deviceId={deviceId}
          videoId={videoId}
          rightTop={
            <VideoSnapshotBtn
              productKey={productKey}
              deviceId={deviceId}
              videoLiveRef={videoRef}
            />
          }
        />
      </div>
    </div>
  )
})

UsvDetailDetail.displayName = 'UsvDetailDetail'

export default UsvDetailDetail
