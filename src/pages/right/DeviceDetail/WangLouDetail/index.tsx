import { lazy, memo, type FC } from 'react'
import CloseableHeader from '../../components/CloseableHeader'
import DeviceIconCamera from '@/assets/icons/jsx/device/DeviceIconCamera'
import { Segmented } from 'antd'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import IconData from '@/assets/icons/jsx/IconData'
import AppViewSuspense from '@/components/AppViewSuspense'
import {
  useCreateWangLouControlRoomStore,
  WangLouControlRoomStoreContext,
} from '@/store/context-store/useWangLouControlRoom.store'
import useServerEventMsg from '@/pages/control-room/uav/hooks/useServerEventMsg'
import WanglouUpdateRealMarker from './components/UpdateRealMarker'
import { ScrollArea } from '@/components/ui/scroll-area'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const WangLouDetailDetail = lazy(
  () => import('./components/WangLouDetailDetail'),
)
const WangLouDetailData = lazy(() => import('./components/WangLouDetailData'))

const WangLouDetail: FC<PropsType> = memo(({ data }) => {
  const productKey = data.productKey || data.deviceModel?.productKey
  const deviceId = data.deviceId
  const store = useCreateWangLouControlRoomStore(
    productKey!,
    deviceId,
    useServerEventMsg(),
  )

  const header = useMemo(
    () => (
      <div className="flex gap-2 items-center">
        <DeviceIconCamera className="device-detail-icon" />
        <h6 className="text-white text-base">{data.deviceName}</h6>
      </div>
    ),
    [data.deviceName],
  )

  const [tab, setTab] = useState('详情')
  const segmentOptions = useRef([
    {
      label: '详情',
      value: '详情',
      icon: <IconDetail />,
    },
    {
      label: '数据',
      value: '数据',
      icon: <IconData />,
    },
  ]).current

  return (
    <WangLouControlRoomStoreContext.Provider value={store}>
      <div className="overflow-y-hidden flex flex-col backdrop-blur-sm">
        <CloseableHeader>{header}</CloseableHeader>
        <div className="px-3 mt-1 mb-3">
          <Segmented
            block
            value={tab}
            options={segmentOptions}
            onChange={setTab}
          />
        </div>
        {/* <div className="flex-1 overflow-y-auto"> */}
        <ScrollArea className="grow">
          <AppViewSuspense>
            {tab === '详情' ? (
              <WangLouDetailDetail />
            ) : (
              <WangLouDetailData deviceId={deviceId} />
            )}
          </AppViewSuspense>
        </ScrollArea>
        {/* </div> */}
      </div>
      <WanglouUpdateRealMarker />
    </WangLouControlRoomStoreContext.Provider>
  )
})

WangLouDetail.displayName = 'WangLouDetail'

export default WangLouDetail
