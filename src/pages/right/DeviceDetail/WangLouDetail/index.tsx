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
import { BaseDeviceDetailProps } from '../routes'

type PropsType = BaseDeviceDetailProps

const WangLouDetailDetail = lazy(
  () => import('./components/WangLouDetailDetail'),
)
const WangLouDetailData = lazy(() => import('./components/WangLouDetailData'))

const WangLouDetail: FC<PropsType> = memo(
  ({ data, headerTools, headerProps, onClose }) => {
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
    const { t } = useTranslation()
    const [tab, setTab] = useState(0)

    return (
      <WangLouControlRoomStoreContext.Provider value={store}>
        <div className="overflow-y-hidden flex flex-col backdrop-blur-sm">
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
          {/* <div className="flex-1 overflow-y-auto"> */}
          <ScrollArea className="grow">
            <AppViewSuspense>
              {tab === 0 ? (
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
  },
)

WangLouDetail.displayName = 'WangLouDetail'

export default WangLouDetail
