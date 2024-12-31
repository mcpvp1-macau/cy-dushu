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
import useServerEventMsg from '@/pages/control-room/uav/hooks/useServerEventMsg'

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
  const productKey = (data.productKey || data.deviceModel?.productKey)!
  const deviceId = data.deviceId
  const store = useCreateUavControlRoomStore(
    productKey,
    deviceId,
    useServerEventMsg(),
  )

  useEffect(() => {
    store?.getState()?.resetState()
    store?.getState()?.updateProdctKeyAndDeviceId(productKey, deviceId)
  }, [deviceId])

  const [tab, setTab] = useState(0)

  const { t } = useTranslation()

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
                label: t('common.detail'),
                value: 0,
                icon: <IconDetail />,
              },
              {
                label: t('common.data'),
                value: 1,
                icon: <IconData />,
              },
            ]}
            onChange={setTab}
          />
        </div>
        <ScrollArea className="grow">
          {tab === 0 ? <UavDetailDetail data={data} /> : <UavDetailData />}
        </ScrollArea>
      </div>
      <UavUpdateRealMarker />
    </UavControlRoomStoreContext.Provider>
  )
})

UavDetail.displayName = 'UavDetail'

export default UavDetail
