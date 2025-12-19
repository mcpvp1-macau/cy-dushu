import { DeviceDetailParams, WindowType } from '@/store/useFixedWindows.store'
import BaseWindow, { MouseActionType } from './BaseWindow'
import { LoadingOutlined } from '@ant-design/icons'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useStore } from 'zustand'
import AppSpin from '@/components/AppSpin'
import { getDeviceDetailComponent } from '@/pages/right/DeviceDetail/routes'
import { DeviceEnum } from '@/enum/device'
import AppViewSuspense from '@/components/AppViewSuspense'
import { ComponentRef } from 'react'
type PropsType = {
  data: WindowType & { params: DeviceDetailParams }
}

/** 窗口 - 设备详情 */
const FixedWindowDeviceDetail: FC<PropsType> = memo(({ data }) => {
  const { store: deviceDetailStore, isLoading } = useCreateDeviceDetailStore(
    data.params.deviceId,
  )
  const detail = useStore(deviceDetailStore, (s) => s.deviceDetail)

  const DetailComponent = useMemo(() => {
    if (!detail) return null
    return getDeviceDetailComponent(detail.deviceType as DeviceEnum)
  }, [detail?.deviceType])

  const windowRef = useRef<ComponentRef<typeof BaseWindow>>(null)

  return (
    <BaseWindow
      ref={windowRef}
      id={data.id}
      zIndex={data.zIndex}
      noHeader
      noBorder
      resizeAbleX={false}
      {...data.layout}
      title={
        isLoading || !detail ? <LoadingOutlined /> : `${detail.deviceName}`
      }
    >
      {isLoading || !detail || !DetailComponent ? (
        <AppSpin />
      ) : (
        <DeviceDetailStoreContext.Provider value={deviceDetailStore}>
          <div className="h-full w-[350px] flex flex-col overflow-hidden bg-ground-1/90 backdrop-blur-sm rounded border border-solid border-ground-5">
            <AppViewSuspense>
              <DetailComponent
                key={detail.deviceId}
                data={detail}
                onClose={() => {
                  windowRef.current?.handleClose()
                }}
                headerProps={{
                  className: 'cursor-move',
                  onMouseDown: (e) => {
                    windowRef.current?.setMouseAction(MouseActionType.Move)
                    windowRef.current?.handleMouseDown(e)
                  },
                  onTouchStart: (e) => {
                    windowRef.current?.setMouseAction(MouseActionType.Move)
                    windowRef.current?.handleTouchStart(e)
                  },
                }}
              />
            </AppViewSuspense>
          </div>
        </DeviceDetailStoreContext.Provider>
      )}
    </BaseWindow>
  )
})

FixedWindowDeviceDetail.displayName = 'FixedWindowDeviceDetail'

export default FixedWindowDeviceDetail
