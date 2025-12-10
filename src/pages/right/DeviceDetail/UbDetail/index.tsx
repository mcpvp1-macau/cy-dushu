import CloseableHeader from '../../components/CloseableHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import DeviceIcon from '@/components/device/DeviceIcon'
import { BaseDeviceDetailProps } from '../routes'
import UbDetailDetail from './components/UbDetailDetail'
import { DeviceEnum } from '@/enum/device'

const UbDetail: FC<BaseDeviceDetailProps> = memo(
  ({ data, headerTools, headerProps, onClose }) => {
    const { t } = useTranslation()

    return (
      <div className="overflow-y-hidden flex flex-col">
        <CloseableHeader
          onClose={onClose}
          rightTools={headerTools}
          {...headerProps}
        >
          <div className="flex gap-2 items-center">
            <DeviceIcon type={DeviceEnum.UB} className="device-detail-icon" />
            <h6 className="text-hightlight text-base">{data.deviceName}</h6>
          </div>
        </CloseableHeader>
        <ScrollArea className="grow">
          <div className="px-3 mt-2">
            <h6 className="text-sm mb-2 text-fore-secondary">
              {t('common.detail')}
            </h6>
            <UbDetailDetail />
          </div>
        </ScrollArea>
      </div>
    )
  },
)

UbDetail.displayName = 'UbDetail'

export default UbDetail
