import AppCollapse from '@/components/AppCollapse'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import ChildDeviceStatus from './ChildDeviceStatus'
import React from 'react'

type PropsType = {}

const StatusInfo: React.FC<PropsType> = () => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
  const { childDevice } = deviceDetail || {}
  const items =
    childDevice?.map((item) => {
      return {
        label: item.deviceName || item.name,
        key: item.deviceId,
        children: <ChildDeviceStatus data={item} />,
      }
    }) || []

  return (
    <AppCollapse
      className="border-x-0 border-b-0 overflow-y-auto h-full"
      //   accordion
      defaultActiveKey={['1', ...items.map((item) => item.key)]}
      items={[...items]}
    />
  )
}

/** 状态面板 */
export default React.memo(StatusInfo)
