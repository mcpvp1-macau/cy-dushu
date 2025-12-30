import CloseableHeader from '../../components/CloseableHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import DeviceIcon from '@/components/device/DeviceIcon'
import { BaseDeviceDetailProps } from '../routes'
import SmartCarInfoCard from './components/SmartCarInfoCard'
import SmartCarVideo from './components/SmartCarVideo'

const SmartCarDetail: FC<BaseDeviceDetailProps> = memo(
  ({ data, headerTools, headerProps, onClose }) => {
    return (
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
        </ScrollArea>
      </div>
    )
  },
)

SmartCarDetail.displayName = 'SmartCarDetail'

export default SmartCarDetail
