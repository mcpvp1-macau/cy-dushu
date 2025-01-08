import CloseableHeader from '../../components/CloseableHeader'
import DeviceIconAIRPORT from '@/assets/icons/jsx/device/DeviceIconAIRPORT'
import useUserStore from '@/store/useUser.store'
import { shouldJson } from '@/utils/json'
import useWebSocket from 'react-use-websocket'
import { heartbeat } from '@/constant/websocket'
import UavAirportWeatherSection from './components/WeatherSection'
import { enumProperty } from '@/utils/device/property-parse'
import UavAirportInfoCard from './components/InfoCard'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import { Button } from 'antd'
import IconDebug from '@/assets/icons/jsx/uav/IconDebug'
import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import RemoteDebug from './components/RemoteDebug'
import UavAirportUavDetail from './components/Uav'
import { ScrollArea } from '@/components/ui/scroll-area'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import HealthInfoMini from '@/components/device/HealthInfoMini'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const items: XFormItem[] = [
  {
    label: '起飞高度',
    name: 'height',
    type: 'input-number',
    rules: [{ required: true, message: '请输入起飞高度' }],
    otherProps: { style: { width: '100%' } },
  },
  {
    label: '返航高度',
    name: 'gohomeAltitude',
    type: 'input-number',
    otherProps: { style: { width: '100%' }, min: 50, max: 500 },
  },
]

const map = new Map<string, string>([
  ['device_reboot', '机场重启'],
  ['drone_open', '飞行器开机'],
  ['drone_close', '飞行器关机'],
  ['cover_open', '打开舱盖'],
  ['cover_close', '关闭舱盖'],
])

const UavAirportDetail: FC<PropsType> = memo(({ data }) => {
  const productKey = data.productKey || data.deviceModel?.productKey
  const deviceId = data.deviceId
  const videoId = data?.properties.videoList?.[0]?.videoId ?? ''

  const [state, setState] = useState<Record<string, any>>({})

  const [progressState, setProgressState] = useState<any[]>([])
  /** WebSocket 处理 */
  const handleMessage = useMemoizedFn((evt: WebSocketEventMap['message']) => {
    const { data } = evt
    const wsData = shouldJson(data)
    if (!wsData) {
      return
    }
    switch (wsData.method) {
      case 'event.property.post':
      case 'properties.state':
        // 属性变化
        if (wsData.deviceId === deviceId) {
          setState({ ...state, ...wsData.data })
        }
        break
      case 'event.progress.info':
        const { data } = wsData
        const record = {
          ...data,
          time: dayjs(wsData.timestamp),
        }
        if (map.get((data.name as string).toLowerCase())) {
          setProgressState((prev) => [record, ...prev].slice(0, 10))
        }
        break
    }
  })

  const token = useUserStore((s) => s.token)
  const wsUrl = useMemo(() => {
    if (!productKey || !deviceId || !token) {
      return null
    }
    return `${globalConfig.globalWs}://${location.host}/v3/${productKey}/${deviceId}?token=${token}`
    // return `/proxyWsApi/otherWsService/${globalConfig.systemName}/controlServer/v3/${productKey}/${deviceId}?token=${token}`
  }, [productKey, deviceId, token])

  useWebSocket(wsUrl, {
    heartbeat,
    reconnectAttempts: 0x3f3f3f3f,
    retryOnError: true,
    reconnectInterval: 5_000,
    shouldReconnect: () => true,
    onMessage: handleMessage,
  })

  /** 降雨量 */
  const rainfall = useMemo(
    () =>
      enumProperty(data.properties, data.deviceModel.properties, 'rainfall'),
    [data],
  )

  /** 机型 */
  const modelNumber = useMemo(
    () =>
      data.deviceTags?.find((e) => e.tagName === 'MODEL_NUMBER')?.tagValue ?? '',
    [data],
  )

  const onlineStatus = useRealOnlineStatus(deviceId)

  const header = useMemo(
    () => (
      <div className="flex justify-between gap-2">
        <div className="flex gap-2 items-center">
          <DeviceIconAIRPORT className="device-detail-icon" />
          <h6 className="text-white text-base">{data.deviceName}</h6>
        </div>
      </div>
    ),
    [data.deviceName],
  )

  const [openDebug, setOpenDebug] = useState(false)

  const [takeOffOpen, { setTrue: setTakeoffTrue, setFalse: setTakeoffFalse }] =
    useBoolean(false)

  const postDeviceService = usePostDeviceService(productKey, deviceId)
  const handleTakeoffOk = async (values: any) => {
    await postDeviceService('takeoff', values, '一键起飞')
    setTakeoffFalse()
  }

  return (
    <>
      <div className="overflow-y-hidden flex flex-col relative backdrop-blur-sm">
        <CloseableHeader>
          <div className="flex gap-2 items-center">
            {header}
            {state.healthInfo?.length && (
              <HealthInfoMini healthInfo={state.healthInfo} />
            )}
          </div>
        </CloseableHeader>
        <ScrollArea className="grow">
          <div className="mx-3">
            <UavAirportWeatherSection
              windSpeed={state.windSpeed}
              rainfall={rainfall}
              temperature={state.temperature}
              environmentTemperature={state.environmentTemperature}
            />
          </div>
          <div className="my-3 mx-3">
            <UavAirportInfoCard
              modelNumber={modelNumber}
              onlineStatus={onlineStatus}
              modeDisplay={state.modeDisplay}
              stockStatus={state.isInDock}
            />
          </div>
          <div className="mx-3 rounded overflow-hidden">
            <DeviceLiveVideo
              productKey={productKey}
              deviceId={deviceId}
              videoId={videoId}
            />
          </div>
          <div className="my-3 flex gap-2 px-3">
            <Button
              block
              className="h-7"
              icon={<IconDebug />}
              onClick={() => setOpenDebug(true)}
            >
              远程调试
            </Button>
            <Button
              disabled={state.modeCode !== 0}
              block
              className="h-7"
              icon={<IconTakeoff />}
              onClick={setTakeoffTrue}
            >
              一键起飞
            </Button>
          </div>

          {data?.childDevice?.[0]?.deviceId && (
            <UavAirportUavDetail deviceId={data?.childDevice?.[0]?.deviceId} />
          )}
        </ScrollArea>
      </div>
      {openDebug && (
        <RemoteDebug
          data={data}
          state={state}
          progress={progressState}
          onClose={() => setOpenDebug(false)}
        />
      )}
      {takeOffOpen && (
        <FormModal
          initialValues={{
            height: 100,
          }}
          title="相对起飞 (m)"
          open={takeOffOpen}
          items={items}
          onClose={setTakeoffFalse}
          onConfirm={handleTakeoffOk}
          confirmLoading={state.modeCode !== 0}
        />
      )}
    </>
  )
})

UavAirportDetail.displayName = 'UavAirportDetail'

export default UavAirportDetail
