import CloseableHeader from '../../components/CloseableHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import DeviceIcon from '@/components/device/DeviceIcon'
import { BaseDeviceDetailProps } from '../routes'
import SmartCarInfoCard from './components/SmartCarInfoCard'
import SmartCarVideo from './components/SmartCarVideo'
import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import { Button } from 'antd'
import { Link } from 'react-router-dom'
import {
  SmartCarControlRoomStoreContext,
  useCreateSmartCarControlRoomStore,
} from '@/store/context-store/useSmartCarControlRoom.store'

const SmartCarDetail: FC<BaseDeviceDetailProps> = memo(
  ({ data, headerTools, headerProps, onClose }) => {
    const deviceId = data.deviceId ?? ''
    const productKey = data.productKey ?? data.deviceModel?.productKey ?? ''

    const smartCarStore = useCreateSmartCarControlRoomStore(
      productKey,
      deviceId,
    )

    return (
      <SmartCarControlRoomStoreContext.Provider value={smartCarStore}>
        <div className="overflow-y-hidden flex flex-col">
          <CloseableHeader
            onClose={onClose}
            rightTools={headerTools}
            {...headerProps}
          >
            <div className="flex gap-2 items-center">
              <DeviceIcon
                type={data.deviceType ?? ''}
                className="device-detail-icon"
              />
              <h6 className="text-hightlight text-base">
                {data.deviceName ?? '-'}
              </h6>
            </div>
          </CloseableHeader>
          <ScrollArea className="grow">
            <div className="mb-3">
              <SmartCarInfoCard />
            </div>
            <div className="mb-3">
              <SmartCarVideo dataDetail={data} />
            </div>
            <section className="mx-3 mr-[9px] my-3 flex gap-2">
              {/* 边界情况：缺少 deviceId 时禁用跳转按钮。 */}
              {deviceId ? (
                <Link
                  className="grow"
                  to={`/control-room/smart-car/${deviceId}`}
                >
                  <Button block className="h-7" icon={<IconControlRoom />}>
                    进入驾驶舱
                  </Button>
                </Link>
              ) : (
                <Button
                  block
                  className="h-7"
                  icon={<IconControlRoom />}
                  disabled
                >
                  进入驾驶舱
                </Button>
              )}
            </section>
          </ScrollArea>
        </div>
      </SmartCarControlRoomStoreContext.Provider>
    )
  },
)

SmartCarDetail.displayName = 'SmartCarDetail'

export default SmartCarDetail
