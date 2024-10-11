import { memo, type FC } from 'react'
import CloseableHeader from '../../components/CloseableHeader'
import DeviceIconUAV from '@/assets/icons/jsx/device/DeviceIconUAV'
import { Segmented } from 'antd'
import UavDetailDetail from './components/UavDetailDetail'
import UavDetailData from './components/UavDetailData'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import IconData from '@/assets/icons/jsx/IconData'
import {
  UavControlRoomStoreContext,
  useCreateUavControlRoomStore,
} from '@/store/context-store/useUavControlRoom.store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDeviceDetailStore } from '../hooks/useDeviceDetail.store'
import UavCreateAction from './components/UavCreateAction'
import UavUpdateRealMarker from './components/UpdateRealMarker'

const Header: FC = memo(() => {
  const deviceName =
    useDeviceDetailStore((s) => s.deviceDetail?.deviceName) ?? ''
  const { actionId } = useParams()

  return (
    <div className="flex justify-between">
      <div className="flex gap-2 items-center">
        <DeviceIconUAV className="device-detail-icon" />
        <h6 className="text-white text-base">{deviceName}</h6>
      </div>
      {actionId && <UavCreateAction />}
    </div>
  )
})

Header.displayName = 'UavDetailHeader'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const UavDetail: FC<PropsType> = memo(({ data }) => {
  const productKey = data.productKey || data.deviceModel?.productKey
  const deviceId = data.deviceId
  const store = useCreateUavControlRoomStore(productKey, deviceId)

  useEffect(() => {
    store?.getState()?.resetState()
  }, [deviceId])

  const [tab, setTab] = useState('详情')

  return (
    <UavControlRoomStoreContext.Provider value={store}>
      <div className="overflow-y-hidden flex flex-col backdrop-blur-sm">
        <CloseableHeader>
          <Header />
        </CloseableHeader>
        <div className="px-3 mt-1 mb-3">
          <Segmented
            block
            value={tab}
            // options={segmentOptions.current!}
            options={[
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
            ]}
            onChange={setTab}
          />
        </div>
        <ScrollArea className="grow">
          {tab === '详情' ? <UavDetailDetail data={data} /> : <UavDetailData />}
        </ScrollArea>
      </div>
      <UavUpdateRealMarker />
    </UavControlRoomStoreContext.Provider>
  )
})

UavDetail.displayName = 'UavDetail'

export default UavDetail
