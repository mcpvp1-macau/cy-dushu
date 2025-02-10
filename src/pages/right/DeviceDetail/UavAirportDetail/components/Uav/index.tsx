import DeviceIconUAV from '@/assets/icons/jsx/device/DeviceIconUAV'
import { LoadingOutlined } from '@ant-design/icons'
import { lazy } from 'react'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '../../../hooks/useDeviceDetail.store'
import { useStore } from 'zustand'
import AppSpin from '@/components/AppSpin'
import useWebSocket from 'react-use-websocket'
import { heartbeat } from '@/constant/websocket'
import useUserStore from '@/store/useUser.store'
import { shouldJson } from '@/utils/json'
import { Segmented } from 'antd'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import IconData from '@/assets/icons/jsx/IconData'
import AppViewSuspense from '@/components/AppViewSuspense'
import UavCreateAction from '../../../UavDetail/components/UavCreateAction'

const UavAirportUavDetailDetail = lazy(() => import('./components/Detail'))
const UavDetailData = lazy(
  () => import('../../../UavDetail/components/UavDetailData'),
)

type PropsType = {
  deviceId: string
}

/** 机场的无人机详情 */
const UavAirportUavDetail: FC<PropsType> = memo(({ deviceId }) => {
  const { t } = useTranslation()

  const { store: deviceDetailStore, isLoading } =
    useCreateDeviceDetailStore(deviceId)
  const data = useStore(deviceDetailStore, (s) => s.deviceDetail)

  const [state, setState] = useState<Record<string, any>>({})
  const productKey = data?.productKey || data?.deviceModel?.productKey
  const token = useUserStore((s) => s.token)
  const wsUrl = useMemo(() => {
    if (!productKey) {
      return null
    }
    return `${globalConfig.globalWs}://${location.host}/v3/${productKey}/${deviceId}?token=${token}`
  }, [deviceId, productKey, token])

  const queryClient = useQueryClient()

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
        setState(wsData.data)
        break
      case 'MULTI_LINK_STATE':
        // 链路变化
        queryClient.invalidateQueries({
          queryKey: ['getDeviceLinks', { productKey, deviceId }],
        })
        break
      case 'event.targetInfo.info':
        // 智能追踪 目标信息
        break
    }
  })

  useWebSocket(wsUrl, {
    heartbeat,
    reconnectAttempts: 0x3f3f3f3f,
    retryOnError: true,
    reconnectInterval: 5_000,
    shouldReconnect: () => true,
    onMessage: handleMessage,
  })

  const { actionId } = useParams()

  const header = useMemo(
    () => (
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <DeviceIconUAV className="device-detail-icon" />
          <h6 className="text-white text-base">
            {isLoading || !data ? <LoadingOutlined /> : data?.deviceName}
          </h6>
        </div>
        {actionId && <UavCreateAction />}
      </div>
    ),
    [data?.deviceName, isLoading, actionId],
  )

  const [tab, setTab] = useState(0)
  const segmentOptions = useMemo(
    () => [
      {
        label: t('common.detail'),
        value: 0,
        icon: <IconDetail />,
      },
      {
        label: t('common.data'),
        value: 1,
        icon: <IconData />,
      },
    ],
    [t],
  )

  return (
    <DeviceDetailStoreContext.Provider value={deviceDetailStore}>
      <div className="px-3">{header}</div>
      {isLoading || !data ? (
        <AppSpin />
      ) : (
        <div>
          <Segmented
            className="mx-3 mt-2"
            block
            value={tab}
            options={segmentOptions}
            onChange={setTab}
          />
          <div className="flex-1 overflow-y-auto">
            <AppViewSuspense>
              {tab === 0 ? (
                <UavAirportUavDetailDetail state={state} />
              ) : (
                <div className="mt-3">
                  <UavDetailData />
                </div>
              )}
            </AppViewSuspense>
          </div>
        </div>
      )}
    </DeviceDetailStoreContext.Provider>
  )
})

UavAirportUavDetail.displayName = 'UavAirportUavDetail'

export default UavAirportUavDetail
