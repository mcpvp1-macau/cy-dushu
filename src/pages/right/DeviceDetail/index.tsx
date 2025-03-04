import AppViewSuspense from '@/components/AppViewSuspense'
import AppSpin from '@/components/AppSpin'
import { DeviceEnum } from '@/enum/device'
import useRightMode from '@/store/layout/useRightMode.store'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from './hooks/useDeviceDetail.store'
import { useStore } from 'zustand'
import { bigFlyEmitter } from '@/map/GlobalMap/BigFlyListener'
import { getDeviceDetailComponent } from './routes'

type PropsType = unknown

const RightDeviceDetail: FC<PropsType> = memo(() => {
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)
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

  const DetailComponent = getDeviceDetailComponent(
    deviceDetail.deviceType as DeviceEnum,
  )

  return (
    <DeviceDetailStoreContext.Provider value={deviceDetailStore}>
      <div className="w-[350px] flex flex-col overflow-y-hidden">
        <AppViewSuspense>
          <DetailComponent
            key={deviceDetail.deviceId}
            data={deviceDetail}
            onClose={() => {
              updateRightMode(null)
              updateDetailId(null)
            }}
          />
        </AppViewSuspense>
      </div>
    </DeviceDetailStoreContext.Provider>
  )
})

RightDeviceDetail.displayName = 'RightDevice'

export default RightDeviceDetail
