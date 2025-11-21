import DeviceIcon from '@/components/device/DeviceIcon'
import CloseableHeader from '../../components/CloseableHeader'
import { BaseDeviceDetailProps } from '../routes'
import { Segmented } from 'antd'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import IconData from '@/assets/icons/jsx/IconData'
import { ScrollArea } from '@/components/ui/scroll-area'
import RebotDogDetailDetail from './components/Detail'
import RebotDogDetailData from './components/Data'
import {
  RebotDogControlRoomStoreContext,
  useCreateRebotDogControlRoomStore,
} from '@/store/context-store/useRebotDogControlRoom.store'
import { DeviceEnum } from '@/enum/device'

const RobotDogDetail: FC<BaseDeviceDetailProps> = memo(
  ({ data, headerTools, headerProps, onClose }) => {
    const [tab, setTab] = useState(0)
    const { t } = useTranslation()

    const controlRoomStore = useCreateRebotDogControlRoomStore(
      data.productKey ?? data.deviceModel.productKey,
      data.deviceId,
    )

    return (
      <RebotDogControlRoomStoreContext.Provider value={controlRoomStore}>
        <div className="overflow-y-hidden flex flex-col">
          <CloseableHeader
            onClose={onClose}
            rightTools={headerTools}
            {...headerProps}
          >
            <div className="flex gap-2 items-center">
              <DeviceIcon
                type={DeviceEnum.ROBOT_DOG}
                className="device-detail-icon"
              />
              <h6 className="text-hightlight text-base">{data.deviceName}</h6>
            </div>
          </CloseableHeader>
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
          <ScrollArea className="grow">
            {tab === 0 ? <RebotDogDetailDetail /> : <RebotDogDetailData />}
          </ScrollArea>
        </div>
      </RebotDogControlRoomStoreContext.Provider>
    )
  },
)

RobotDogDetail.displayName = 'RobotDogDetail'

export default RobotDogDetail
