import AppCollapse from '@/components/AppCollapse'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import ChildDeviceStatus from './ChildDeviceStatus'
import React from 'react'
import StatusPic from './StatusPic'
import StatusInfoCard from './StatusInfo'

import SearchRadarStatusInfo from './SearchRadarStatusInfo'
import TrackingRadarStatusInfo from './TrackingRadarStatusInfo'
import ElectroOpticalStatusInfo from './ElectroOpticalStatusInfo'
import LaserStatusInfo from './LaserStatusInfo'

type PropsType = Record<string, never>

const StatusInfo: React.FC<PropsType> = () => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
  const { childDevice } = deviceDetail || {}
  const _items =
    childDevice?.map((item) => {
      return {
        label: item.deviceName || item.name,
        key: item.deviceId,
        children: <ChildDeviceStatus data={item} />,
      }
    }) || []


    console.info(deviceDetail?.deviceModel)

  return (
    <AppCollapse
      className="border-x-0 border-b-0 overflow-y-auto h-full"
      //   accordion
      defaultActiveKey={['1', '2', '3', '4', '5', '6', '7']}
      items={[
        {
          label: '状态监测',
          key: '1',
          children: <StatusPic />,
        },
        {
          label: '设备状态',
          key: '2',
          children: <StatusInfoCard />,
        },
        // {
        //   label: '火炮',
        //   key: '3',
        //   children: <ArtilleryStatusInfo />,
        // },
        {
          label: '搜索雷达',
          key: '4',
          children: <SearchRadarStatusInfo />,
        },
        {
          label: '跟踪雷达',
          key: '5',
          children: <TrackingRadarStatusInfo />,
        },
        {
          label: '光电',
          key: '6',
          children: <ElectroOpticalStatusInfo />,
        },
        {
          label: '激光',
          key: '7',
          children: <LaserStatusInfo />,
        },
      ]}
    />
  )
}

/** 状态面板 */
export default React.memo(StatusInfo)
