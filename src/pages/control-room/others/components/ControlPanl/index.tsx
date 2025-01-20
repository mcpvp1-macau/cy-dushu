import AppCollapse from '@/components/AppCollapse'
import TurntableControl from './TurntableControl'
import ZoomControl from './ZoomControl'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import React from 'react'

const ControlPanl: React.FC = () => {
  const data = useDeviceDetailStore((s) => s.deviceDetail)
  const zoomDevices = data?.childDevice?.filter((item) => {
    // TODO 判断是否有zoom ，这里的zoomByStep 不同的设备可能不同
    return !!item.deviceModel.services['zoomByStep']
  })
  return (
    <AppCollapse
      className="border-x-0 border-b-0 overflow-y-auto h-full"
      //   accordion
      defaultActiveKey={['1', '2', '3', '4']}
      items={[
        {
          label: '转台控制',
          key: '2',
          children: <TurntableControl />,
        },
        ...(zoomDevices?.map((item) => {
          return {
            label: `${item.deviceName || item.name}控制`,
            key: item.deviceId,
            children: <ZoomControl item={item} />,
          }
        }) || []),
      ]}
    />
  )
}

/** 控制面板 */
export default React.memo(ControlPanl)
