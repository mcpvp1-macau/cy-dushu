import IconData from '@/assets/icons/jsx/IconData'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import useServerEventMsg from '@/pages/control-room/uav/hooks/useServerEventMsg'
import {
  OthersControlRoomStoreContext,
  useCreateOthersControlRoomStore,
} from '@/store/context-store/useOthersControlRoom.store'
import { lazy } from 'react'
import CloseableHeader from '../../components/CloseableHeader'
import { Segmented } from 'antd'
import { ScrollArea } from '@/components/ui/scroll-area'
import AppViewSuspense from '@/components/AppViewSuspense'
import { BaseDeviceDetailProps } from '../routes'
import DeviceIcon from '@/components/device/DeviceIcon'
import UpdateRealMarker from './components/UpdateRealMarker'

const OthersDetailDetail = lazy(() => import('./components/OthersDetailDetail'))
const OthersDetailData = lazy(() => import('./components/OthersDetailData'))

type PropsType = BaseDeviceDetailProps

const OthersDetail: FC<PropsType> = memo(
  ({ data, headerTools, headerProps, onClose }) => {
    const productKey = data.productKey || data.deviceModel?.productKey
    const deviceId = data.deviceId
    const deviceType = data.deviceType
    const store = useCreateOthersControlRoomStore(
      productKey!,
      deviceId,
      useServerEventMsg(),
    )

    const header = useMemo(
      () => (
        <div className="flex gap-2 items-center">
          {/* <DeviceIconCamera className="device-detail-icon" /> */}
          <DeviceIcon type={deviceType} className="device-detail-icon" />
          <h6 className="text-hightlight text-base">{data.deviceName}</h6>
        </div>
      ),
      [data.deviceName],
    )

    const [tab, setTab] = useState(0)
    const { t } = useTranslation()

    return (
      <OthersControlRoomStoreContext.Provider value={store}>
        <div className="overflow-y-hidden flex flex-col">
          <CloseableHeader
            onClose={onClose}
            rightTools={headerTools}
            {...headerProps}
          >
            {header}
          </CloseableHeader>
          <div className="px-3 mt-1 mb-3">
            <Segmented
              block
              value={tab}
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
            <AppViewSuspense>
              {tab === 0 ? (
                <OthersDetailDetail />
              ) : (
                <OthersDetailData deviceId={deviceId} deviceType={deviceType} />
              )}
            </AppViewSuspense>
          </ScrollArea>
        </div>
        <UpdateRealMarker />
      </OthersControlRoomStoreContext.Provider>
    )
  },
)

OthersDetail.displayName = 'OthersDetail'

export default OthersDetail
