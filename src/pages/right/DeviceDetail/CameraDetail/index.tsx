import { lazy } from 'react'
import CloseableHeader from '../../components/CloseableHeader'
import DeviceIconCamera from '@/assets/icons/jsx/device/DeviceIconCamera'
import { Segmented } from 'antd'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import IconData from '@/assets/icons/jsx/IconData'
import AppViewSuspense from '@/components/AppViewSuspense'
import { BaseDeviceDetailProps } from '../routes'
import {
  OthersControlRoomStoreContext,
  useCreateOthersControlRoomStore,
} from '@/store/context-store/useOthersControlRoom.store'
import useServerEventMsg from '@/pages/control-room/uav/hooks/useServerEventMsg'

type PropsType = BaseDeviceDetailProps

const CameraDetailDetail = lazy(() => import('./components/CameraDetailDetail'))
const CameraDetailData = lazy(() => import('./components/CameraDetailData'))

const CameraDetail: FC<PropsType> = memo(({ data, headerTools, onClose }) => {
  const header = useMemo(
    () => (
      <div className="flex gap-2 items-center">
        <DeviceIconCamera className="device-detail-icon" />
        <h6 className="text-white text-base">{data.deviceName}</h6>
      </div>
    ),
    [data.deviceName],
  )
  const productKey = data.productKey || data.deviceModel?.productKey
  const deviceId = data.deviceId
  const deviceType = data.deviceType

  const store = useCreateOthersControlRoomStore(
    productKey!,
    deviceId,
    useServerEventMsg(),
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
    <OthersControlRoomStoreContext.Provider value={store}>
      <div>
        <CloseableHeader onClose={onClose} rightTools={headerTools}>
          {header}
        </CloseableHeader>
        <div className="px-3 mt-1 mb-3">
          <Segmented
            block
            value={tab}
            options={segmentOptions}
            onChange={setTab}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <AppViewSuspense>
            {tab === '详情' ? <CameraDetailDetail /> : <CameraDetailData />}
          </AppViewSuspense>
        </div>
      </div>
    </OthersControlRoomStoreContext.Provider>
  )
})

CameraDetail.displayName = 'CameraDetail'

export default CameraDetail
