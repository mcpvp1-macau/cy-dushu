import AppViewSuspense from '@/components/AppViewSuspense'
import { lazy } from 'react'
import useDeviceChildrenList from '@/hooks/device/useDeviceChildrenList'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'

export type MediaType = 'PICTURE' | 'HISTORY_VIDEO'

type PropsType = {
  type: MediaType
  deviceDetail: API_DEVICE.domain.Device
}

const DeviceDetailMediaDataPicture = lazy(
  () => import('../MediaData/MediaPicture'),
)
const HistoryVideo = lazy(() => import('../HistoryVideo'))

const DeviceDetailMediaData: FC<PropsType> = memo(({ type, deviceDetail }) => {
  const deviceList = useDeviceChildrenList(deviceDetail)

  const timeRange = useBackTrackingStore((s) => s.timeRange)

  return (
    <AppViewSuspense>
      {{
        PICTURE: (
          <DeviceDetailMediaDataPicture
            deviceList={deviceList}
            timeRange={timeRange}
          />
        ),
        HISTORY_VIDEO: (
          <HistoryVideo
            deviceList={deviceList}
            deviceType={deviceDetail.deviceType}
            timeRange={timeRange}
          />
        ),
      }[type] || <div>404</div>}
    </AppViewSuspense>
  )
})

DeviceDetailMediaData.displayName = 'UavDetailMediaData'

export default DeviceDetailMediaData
