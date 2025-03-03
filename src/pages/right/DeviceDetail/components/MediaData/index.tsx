import AppViewSuspense from '@/components/AppViewSuspense'
import { lazy } from 'react'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useDeviceChildrenList from '@/hooks/device/useDeviceChildrenList'
import AppSpin from '@/components/AppSpin'

export type MediaType = 'PICTURE' | 'HISTORY_VIDEO'

type PropsType = {
  type: MediaType
}

const DeviceDetailMediaDataPicture = lazy(() => import('./MediaPicture'))
const HistoryVideo = lazy(() => import('../HistoryVideo'))

const DeviceDetailMediaData: FC<PropsType> = memo(({ type }) => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const deviceList = useDeviceChildrenList(deviceDetail ?? undefined)

  if (!deviceDetail) {
    return <AppSpin />
  }

  return (
    <AppViewSuspense>
      {{
        PICTURE: <DeviceDetailMediaDataPicture deviceList={deviceList} />,
        HISTORY_VIDEO: (
          <HistoryVideo
            deviceList={deviceList}
            deviceType={deviceDetail.deviceType}
          />
        ),
      }[type] || <div>404</div>}
    </AppViewSuspense>
  )
})

DeviceDetailMediaData.displayName = 'UavDetailMediaData'

export default DeviceDetailMediaData
