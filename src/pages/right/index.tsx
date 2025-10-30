import AppViewSuspense from '@/components/AppViewSuspense'
import { RightModeEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import { lazy } from 'react'
import OverlayDetail from './right-tools/OverlayDetail/OverlayDetail'
import RightRangingPanel from './right-tools/Ranging'
import { useSonner } from 'sonner'

const RightDeviceDetail = lazy(() => import('./DeviceDetail'))
const RightAddPoint = lazy(() => import('./right-tools/AddPoint'))
const RightAddGeometry = lazy(() => import('./right-tools/AddGeometry/index'))
const RightEventDetail = lazy(() => import('./EventDetail'))
const TargetDetail = lazy(() => import('./TargetDetail'))
const ReconstructionDetail = lazy(
  () => import('./right-tools/ReconstructionDetail'),
)
const FlightAreaDetail = lazy(
  () => import('./right-tools/FlightAreaDetail/FlightAreaDetail'),
)
const RightDeviceOverlayDetail = lazy(
  () => import('./right-tools/DeviceOverlayDetail/DeviceOverlayDetail'),
)

const route = {
  [RightModeEnum.DEVICE]: RightDeviceDetail,
  [RightModeEnum.SET_POINT]: RightAddPoint,
  [RightModeEnum.DRAW_GEOMETRY]: RightAddGeometry,
  // 使用DRAW_GEOMETRY一样的组件，通过useMapDrawStore的isFlightArea来判断是绘制飞行区域还是普通绘制
  [RightModeEnum.DRAW_FLIGHT_AREA]: RightAddGeometry,
  [RightModeEnum.OVERLYA_DETAIL]: OverlayDetail,
  [RightModeEnum.RANGING]: RightRangingPanel,
  [RightModeEnum.EVENT_DETAIL]: RightEventDetail,
  [RightModeEnum.RADAR_TARGET]: TargetDetail,
  [RightModeEnum.RECONSTRUCTION_DETAIL]: ReconstructionDetail,
  [RightModeEnum.FLIGHT_AREA_DETAIL]: FlightAreaDetail,
  [RightModeEnum.DEVICE_OVERLAY_DETAIL]: RightDeviceOverlayDetail,
}

type PropsType = unknown

const Right: FC<PropsType> = memo(() => {
  const rightMode = useRightMode((s) => s.rightMode)

  const { toasts } = useSonner()

  const layoutShift = useMemo(() => {
    if (toasts.length === 0) {
      return 0
    }
    return 70 + Math.min(3, toasts.length) * 10
  }, [toasts.length])

  if (!rightMode || rightMode === RightModeEnum.HIDE) {
    return null
  }

  const RightComponent = route[rightMode]

  if (!RightComponent) {
    return <div className="absolute top-3 right-[54px] z-10 p-3">404</div>
  }

  return (
    <div
      className={clsx(
        'absolute right-[54px] z-10',
        'bg-[#16202be6] rounded-[3px] backdrop-blur-sm',
        'border border-solid border-ground-5',
        'flex flex-col',
        'overflow-y-hidden',
        'transition-[top,max-height] duration-300',
      )}
      style={{
        maxHeight: `calc(100vh - ${82 + layoutShift}px)`,
        top: `${12 + layoutShift}px`,
      }}
    >
      <AppViewSuspense>{<RightComponent key={rightMode} />}</AppViewSuspense>
    </div>
  )
})

Right.displayName = 'Right'

export default Right
