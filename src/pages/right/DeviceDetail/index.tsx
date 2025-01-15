import AppViewSuspense from '@/components/AppViewSuspense'
import AppSpin from '@/components/AppSpin'
import { DeviceEnum } from '@/enum/device'
import useRightMode from '@/store/layout/useRightMode.store'
import { lazy, memo, type FC } from 'react'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from './hooks/useDeviceDetail.store'
import { useStore } from 'zustand'
import { bigFlyEmitter } from '@/map/GlobalMap/BigFlyListener'

const UavDetail = lazy(() => import('./UavDetail'))
const UavAirportDetail = lazy(() => import('./UavAirportDetail'))
const CameraDetail = lazy(() => import('./CameraDetail'))
const WangLouDetail = lazy(() => import('./WangLouDetail'))
const OthersDetail = lazy(() => import('./OthersDetail'))

const route = {
  [DeviceEnum.UAV]: UavDetail,
  [DeviceEnum.UAV_AIRPORT]: UavAirportDetail,
  [DeviceEnum.CAMERA]: CameraDetail,
  [DeviceEnum.WANGLOU]: WangLouDetail,
}

type PropsType = unknown

const RightDeviceDetail: FC<PropsType> = memo(() => {
  const detailId = useRightMode((s) => s.detailId)!

  const { store: deviceDetailStore, isLoading } =
    useCreateDeviceDetailStore(detailId)
  const deviceDetail = useStore(deviceDetailStore, (s) => s.deviceDetail)

  // big fly
  useEffect(() => {
    if (!deviceDetail) {
      return
    }
    if (deviceDetail.longitude && deviceDetail.latitude) {
      bigFlyEmitter.emit('bigFly', {
        lng: deviceDetail.longitude,
        lat: deviceDetail.latitude,
      })
    }
  }, [deviceDetail])

  if (isLoading || !deviceDetail) {
    return <AppSpin />
  }

  const DetailComponent = route[deviceDetail.deviceType] || OthersDetail
  if (!DetailComponent) {
    return <div className="p-3">404</div>
  }

  return (
    <DeviceDetailStoreContext.Provider value={deviceDetailStore}>
      <div className="w-[350px] flex flex-col overflow-y-hidden">
        <AppViewSuspense>
          <DetailComponent key={deviceDetail.deviceId} data={deviceDetail} />
        </AppViewSuspense>
      </div>
    </DeviceDetailStoreContext.Provider>
  )
})

RightDeviceDetail.displayName = 'RightDevice'

export default RightDeviceDetail
