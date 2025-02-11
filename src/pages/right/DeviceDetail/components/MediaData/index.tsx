import AppViewSuspense from '@/components/AppViewSuspense'
import { lazy } from 'react'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useDeviceChildrenList from '@/hooks/device/useDeviceChildrenList'

export type MediaType = 'PICTURE' | 'HISTORY_VIDEO'

type PropsType = {
  type: MediaType
}

const DeviceDetailMediaDataPicture = lazy(() => import('./MediaPicture'))
const DeviceDetailMediaHistoryVideo = lazy(() => import('./MediaHistoryVideo'))
const DeviceDetailMediaHistoryM3u8Video = lazy(
  () => import('./MediaHistoryM3u8Video'),
)

const DeviceDetailMediaData: FC<PropsType> = memo(({ type }) => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
  const deviceList = useDeviceChildrenList(deviceDetail)

  return (
    <AppViewSuspense>
      {{
        PICTURE: <DeviceDetailMediaDataPicture deviceList={deviceList} />,
        HISTORY_VIDEO:
          deviceDetail.deviceType === 'WANGLOU' ? (
            <DeviceDetailMediaHistoryM3u8Video deviceList={deviceList} />
          ) : (
            <DeviceDetailMediaHistoryVideo deviceList={deviceList} />
          ),
      }[type] || <div>404</div>}
    </AppViewSuspense>
  )
})

DeviceDetailMediaData.displayName = 'UavDetailMediaData'

export default DeviceDetailMediaData
