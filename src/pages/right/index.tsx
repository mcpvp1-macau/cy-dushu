import AppViewSuspense from '@/components/AppViewSuspense'
import { RightModeEnum, RightOuterEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import { lazy } from 'react'
import OverlayDetail from './right-tools/OverlayDetail/OverlayDetail'
import RightRangingPanel from './right-tools/Ranging'
import { useCurrentToasts } from '@/store/useToast'

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

const RightActionTanqi = lazy(() => import('./ActionTanqi/ActionTanqiWrapper'))

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

const rightOuterRoute = {
  [RightOuterEnum.TANQI]: RightActionTanqi,
}

type PropsType = unknown

const Right: FC<PropsType> = memo(() => {
  const rightMode = useRightMode((s) => s.rightMode)
  const rightOuterMode = useRightMode((s) => s.rightOuterMode)

  const toasts = useCurrentToasts()

  const layoutShift = useMemo(() => {
    if (toasts.length === 0) {
      return 0
    }
    return 70 + Math.min(3, toasts.length) * 10
  }, [toasts.length])

  // 右侧渲染
  const rightRender = useMemo(() => {
    if (!rightMode || rightMode === RightModeEnum.HIDE) {
      return null
    }

    const RightComponent = route[rightMode]

    // 距离右边的像素
    const rightPixel = rightOuterMode ? 54 + 350 + 12 : 54
    // 靠左时，通知挡不到
    const finialLayoutShift = rightOuterMode ? 0 : layoutShift

    if (!RightComponent) {
      return (
        <div
          className="absolute top-3 z-10 p-3"
          style={{ right: `${rightPixel}px` }}
        >
          404
        </div>
      )
    }

    return (
      <div
        className={clsx(
          'absolute z-10',
          'bg-ground-1/90 rounded-[3px] backdrop-blur-sm',
          'border border-solid border-ground-5',
          'flex flex-col',
          'overflow-y-hidden',
          'transition-[top,right,max-height] duration-300',
        )}
        style={{
          maxHeight: `calc(100vh - ${82 + finialLayoutShift}px)`,
          top: `${12 + finialLayoutShift}px`,
          right: `${rightPixel}px`,
        }}
      >
        <AppViewSuspense>{<RightComponent key={rightMode} />}</AppViewSuspense>
      </div>
    )
  }, [rightMode, rightOuterMode, layoutShift])

  // 右侧的右侧渲染
  const rightOuterRender = useMemo(() => {
    if (!rightOuterMode) {
      return null
    }

    const RightOuterComponent = rightOuterRoute[rightOuterMode]

    if (!RightOuterComponent) {
      return (
        <div className="absolute top-3 z-10 p-3" style={{ right: '54px' }}>
          404
        </div>
      )
    }

    return (
      <div
        className={clsx(
          'absolute z-10',
          'bg-ground-1/90 rounded-[3px] backdrop-blur-sm',
          'border border-solid border-ground-5',
          'flex flex-col',
          'overflow-y-hidden',
          'transition-[top,right,max-height] duration-300',
        )}
        style={{
          maxHeight: `calc(100vh - ${82 + layoutShift}px)`,
          top: `${12 + layoutShift}px`,
          right: `54px`,
        }}
      >
        <AppViewSuspense>
          {<RightOuterComponent key={rightOuterMode} />}
        </AppViewSuspense>
      </div>
    )
  }, [rightOuterMode, layoutShift])

  return (
    <>
      {rightRender}
      {rightOuterRender}
    </>
  )
})

Right.displayName = 'Right'

export default Right
