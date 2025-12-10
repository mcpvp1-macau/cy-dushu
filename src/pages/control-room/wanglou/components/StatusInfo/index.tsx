import AppCollapse from '@/components/AppCollapse'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import DeviceStatusInfo from './DeviceStatus'
import ChildDeviceStatus from './ChildDeviceStatus'
import { WanglouDeviceProductMap } from './config'
import useConfig from './useConfig'

type PropsType = Record<string, never>

const StatusInfo: React.FC<PropsType> = () => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
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
          children: <ChildDeviceStatus data={item} />,
        }
      }) || []

  const { t } = useTranslation()

  return (
    <AppCollapse
      className="border-x-0 border-b-0 overflow-y-auto h-full"
      //   accordion
      defaultActiveKey={['1', ...items.map((item) => item.key)]}
      items={[
        {
          label: t('device.wanglou.status.title'),
          key: '1',
          children: <DeviceStatusInfo />,
        },
        ...items,
      ]}
    />
  )
}

export default StatusInfo
