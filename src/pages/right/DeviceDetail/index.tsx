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
import IconButton from '@/components/ui/button/IconButton'
import IconDing from '@/assets/icons/jsx/IconDing'
import useFixedWindowsStore from '@/store/useFixedWindows.store'

type PropsType = unknown

const RightDeviceDetail: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

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

  const addWindow = useFixedWindowsStore((s) => s.addWindow)

  if (isLoading || !deviceDetail) {
    return <AppSpin />
  }

  const DetailComponent = getDeviceDetailComponent(
    deviceDetail.deviceType as DeviceEnum,
  )

  const handleClose = () => {
    updateRightMode(null)
    updateDetailId(null)
  }

  return (
    <DeviceDetailStoreContext.Provider value={deviceDetailStore}>
      <div className="w-[350px] flex flex-col overflow-y-hidden">
        <AppViewSuspense>
          <DetailComponent
            data={deviceDetail}
            headerTools={
              <IconButton
                toolTipProps={{ title: t('common.fixedOut') }}
                onClick={() => {
                  addWindow({
                    params: {
                      type: 'device-detail',
                      deviceId: deviceDetail.deviceId,
                    },
                    layout: {
                      x: document.body.clientWidth / 2 - 176,
                      y: 52,
                      width: 352,
                      height: 600,
                    },
                  })
                  handleClose()
                }}
              >
                <IconDing className="scale-90" />
              </IconButton>
            }
            onClose={handleClose}
          />
        </AppViewSuspense>
      </div>
    </DeviceDetailStoreContext.Provider>
  )
})

RightDeviceDetail.displayName = 'RightDevice'

export default RightDeviceDetail
