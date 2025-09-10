import React from 'react'
import {
  OthersControlRoomStoreContext,
  useCreateOthersControlRoomStore,
} from '@/store/context-store/useOthersControlRoom.store'
import CloseableHeader from '../../components/CloseableHeader'
import { Segmented } from 'antd'
import AppViewSuspense from '@/components/AppViewSuspense'
import { BaseDeviceDetailProps } from '../routes'
import { FC, lazy, memo, useRef } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import IconData from '@/assets/icons/jsx/IconData'
import DeviceIconER_EF_CAR from '@/assets/icons/jsx/device/DeviceIconER_EF_CAR'

const CameraDetailDetail = lazy(() => import('./components/CameraDetailDetail'))
const CameraDetailData = lazy(() => import('./components/CameraDetailData'))

type PropsType = BaseDeviceDetailProps

const ErEfCarDetail: FC<PropsType> = memo(({ data, headerTools, onClose }) => {
  const { t } = useTranslation()

  const store = useCreateOthersControlRoomStore(
    data.productKey ?? data.deviceModel.productKey,
    data.deviceId,
  )

  const header = useMemo(
    () => (
      <div className="flex gap-2 items-center">
        <DeviceIconER_EF_CAR className="device-detail-icon" />
        <h6 className="text-white text-base">{data.deviceName}</h6>
      </div>
    ),
    [data.deviceName],
  )

  const [tab, setTab] = useState('详情')
  const segmentOptions = useRef([
    {
      label: '详情',
      value: '详情',
      icon: <IconDetail />,
    },
    {
      label: '数据',
      value: '数据',
      icon: <IconData />,
    },
  ]).current
  return (
    <OthersControlRoomStoreContext.Provider value={store}>
      <div className="overflow-y-hidden flex flex-col">
        <CloseableHeader onClose={onClose} rightTools={headerTools}>
          {header}
        </CloseableHeader>
        <div className="px-3 mt-1 mb-3">
          <Segmented
            block
            value={tab}
            options={segmentOptions}
            onChange={setTab}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <AppViewSuspense>
            {tab === '详情' ? (
              <CameraDetailDetail />
            ) : (
              <CameraDetailData
                deviceId={data.deviceId}
                deviceType={data.deviceType}
              />
            )}
          </AppViewSuspense>
        </div>
      </div>
    </OthersControlRoomStoreContext.Provider>
  )
})

export default ErEfCarDetail
