import { memo, type FC, lazy } from 'react'
import CameraDetailInfoCard from './CameraDetailInfoCard'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import AppCollapse from '@/components/AppCollapse'
import AppViewSuspense from '@/components/AppViewSuspense'
// import SurveillanceComp from './SurveillanceComp'

const SurveillanceComp = lazy(() => import('./SurveillanceComp'))

const InterferenceComp = lazy(() => import('./InterferenceComp'))

type PropsType = unknown

const CameraDetailDetail: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!

  const deviceId = deviceDetail.deviceId
  const productKey = (deviceDetail.productKey ||
    deviceDetail.deviceModel?.productKey)!

  const modelName =
    deviceDetail.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'

  // console.info(deviceDetail)
  return (
    <div>
      <section className="mx-3"></section>
      <AppCollapse
        className="mt-3 border-x-0 border-b-0"
        defaultActiveKey={['status', 'surveillance', 'interference']}
        items={[
          {
            label: '设备状态',
            key: 'status',
            children: (
              <AppViewSuspense>
                <CameraDetailInfoCard
                  modelNumber={modelName}
                  deviceDetail={deviceDetail}
                />
              </AppViewSuspense>
            ),
          },
          {
            label: '侦察状态',
            key: 'surveillance',
            children: (
              <AppViewSuspense>
                <SurveillanceComp
                  rfList={deviceDetail.properties.rfList}
                  keyAreasList={deviceDetail.properties.keyAreasList}
                />
              </AppViewSuspense>
            ),
          },
          {
            label: '干扰状态',
            key: 'interference',
            children: (
              <AppViewSuspense>
                <InterferenceComp
                  requencyOfJammerList={
                    deviceDetail.properties.requencyOfJammerList
                  }
                />
              </AppViewSuspense>
            ),
          },
        ]}
      />
    </div>
  )
})

CameraDetailDetail.displayName = 'CameraDetailDetail'

export default CameraDetailDetail
