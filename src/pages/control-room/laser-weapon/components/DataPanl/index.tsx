import AiData from '@/components/AiData'
import AppCollapse from '@/components/AppCollapse'
import DeviceAlgorithmList from '@/components/device/algorithm/DeviceAlgorithmList'
import { DeviceEnum } from '@/enum/device'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import React from 'react'

const DataPanl: React.FC = () => {
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const deviceType = useDeviceDetailStore((s) => s.deviceDetail?.deviceType)
  const { t } = useTranslation()
  return (
    <AppCollapse
      className="border-x-0 border-b-0 overflow-y-auto h-full"
      //   accordion
      defaultActiveKey={['1', '2', '3', '4']}
      items={[
        {
          label: t('device.aiModel.title'),
          key: '1',
          children: (
            <>
              <DeviceAlgorithmList
                deviceType={deviceType as DeviceEnum}
                deviceId={deviceId}
                productKey={productKey!}
              />
            </>
          ),
        },
        {
          label: t('common.aiData'),
          key: '2',
          children: <AiData deviceId={deviceId} deviceType={deviceType as DeviceEnum}/>,
        },
      ]}
    />
  )
}

export default React.memo(DataPanl)
