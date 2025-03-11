import DeviceIcon from '@/components/device/DeviceIcon'
import CloseableHeader from '../../components/CloseableHeader'
import { BaseDeviceDetailProps } from '../routes'
import { Segmented } from 'antd'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import IconData from '@/assets/icons/jsx/IconData'

const RobotDogDetail: FC<BaseDeviceDetailProps> = memo(
  ({ data, headerTools, headerProps, onClose }) => {
    const [tab, setTab] = useState(0)
    const { t } = useTranslation()

    return (
      <div className="overflow-y-hidden flex flex-col backdrop-blur-sm">
        <CloseableHeader
          onClose={onClose}
          rightTools={headerTools}
          {...headerProps}
        >
          <div className="flex gap-2 items-center">
            <DeviceIcon type="ROBOT_DOG" className="device-detail-icon" />
            <h6 className="text-white text-base">{data.deviceName}</h6>
          </div>
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
      </div>
    )
  },
)

RobotDogDetail.displayName = 'RobotDogDetail'

export default RobotDogDetail
