import CloseableHeader from '../../components/CloseableHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import DeviceIcon from '@/components/device/DeviceIcon'
import { BaseDeviceDetailProps } from '../routes'
import UbDetailDetail from './components/UbDetailDetail'
import { DeviceEnum } from '@/enum/device'
import { Segmented } from 'antd'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import IconData from '@/assets/icons/jsx/IconData'

const UbDetail: FC<BaseDeviceDetailProps> = memo(
  ({ data, headerTools, headerProps, onClose }) => {
    const { t } = useTranslation()

    const [tab, setTab] = useState(0)

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
          <div className="px-3 mb-3">
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
          <UbDetailDetail />
        </ScrollArea>
      </div>
    )
  },
)

UbDetail.displayName = 'UbDetail'

export default UbDetail
