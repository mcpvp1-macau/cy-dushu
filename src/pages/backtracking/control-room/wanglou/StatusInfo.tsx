import AppCollapse from '@/components/AppCollapse'
import { WanglouDeviceProductMap } from '@/pages/control-room/wanglou/components/StatusInfo/config'
import useConfig from '@/pages/control-room/wanglou/components/StatusInfo/useConfig'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
// import WanglouInfo from './WanglouInfo'
import useBackTrackingInfo from '../../hooks/useBackTrackingInfo'
import ChildDeviceStatus from './ChildDeviceInfo'

const StatusInfo: React.FC = memo(() => {
  const deviceDetail = useBackTrackingStore((s) => s.detail)!

  const updateCurrentAttribute = useBackTrackingStore(
    (s) => s.updateCurrentAttribute,
  )
  useBackTrackingInfo(deviceDetail?.deviceId, updateCurrentAttribute)

  const { childDevice } = deviceDetail || {}
  const { wanglouDeviceInfo } = useConfig()
  const items =
    childDevice
      ?.filter(
        (item) => !!wanglouDeviceInfo[WanglouDeviceProductMap[item.productKey]],
      )
      ?.map((item) => {
        return {
          label: item.deviceName || item.name,
          key: item.deviceId,
          children: (
            <>
              <ChildDeviceStatus data={item} />
            </>
          ),
        }
      }) || []

  const { t } = useTranslation()

  return (
    <AppCollapse
      className="border-x-0 border-b-0 overflow-y-auto h-full"
      //   accordion
      defaultActiveKey={['1', ...items.map((item) => item.key)]}
      items={[
        // {
        //   label: t('device.wanglou.status.title'),
        //   key: '1',
        //   children: (
        //     <>
        //       <WanglouInfo />
        //     </>
        //   ),
        // },
        ...items,
      ]}
    />
  )
})

export default StatusInfo
