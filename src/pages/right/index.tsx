import AppViewSuspense from '@/components/AppViewSuspense'
import { RightModeEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import { lazy } from 'react'
import OverlayDetail from './right-tools/OverlayDetail/OverlayDetail'
import RightRangingPanel from './right-tools/Ranging'

const RightDeviceDetail = lazy(() => import('./DeviceDetail'))
const RightAddPoint = lazy(() => import('./right-tools/AddPoint'))
const RightAddGeometry = lazy(() => import('./right-tools/AddGeometry/index'))
const RightEventDetail = lazy(() => import('./EventDetail'))
const TargetDetail = lazy(() => import('./TargetDetail'))
const ReconstructionDetail = lazy(
  () => import('./right-tools/ReconstructionDetail'),
)

const route = {
  [RightModeEnum.DEVICE]: RightDeviceDetail,
  [RightModeEnum.SET_POINT]: RightAddPoint,
  [RightModeEnum.DRAW_GEOMETRY]: RightAddGeometry,
  [RightModeEnum.POINT_DETAIL]: OverlayDetail,
  [RightModeEnum.RANGING]: RightRangingPanel,
  [RightModeEnum.EVENT_DETAIL]: RightEventDetail,
  [RightModeEnum.RADAR_TARGET]: TargetDetail,
  [RightModeEnum.RECONSTRUCTION_DETAIL]: ReconstructionDetail,
}

type PropsType = unknown

const Right: FC<PropsType> = memo(() => {
  const rightMode = useRightMode((s) => s.rightMode)
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
        'absolute top-3 right-[54px] z-10',
        'bg-[#16202be6] rounded-[3px] backdrop-blur-sm',
        'border border-solid border-ground-5',
        'flex flex-col',
        'overflow-y-hidden',
      )}
      style={{ maxHeight: 'calc(100vh - 82px' }}
    >
      <AppViewSuspense>{<RightComponent key={rightMode} />}</AppViewSuspense>
    </div>
  )
})

Right.displayName = 'Right'

export default Right
