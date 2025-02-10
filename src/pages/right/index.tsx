import AppViewSuspense from '@/components/AppViewSuspense'
import { RightModeEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import { lazy } from 'react'
import OverlayDetail from './right-tools/OverlayDetail/OverlayDetail'
import RightRangingPanel from './right-tools/Ranging'

const RightDeviceDetail = lazy(() => import('./DeviceDetail'))
const RightAddPoint = lazy(() => import('./right-tools/AddPoint'))
const RightAddGeometry = lazy(() => import('./right-tools/AddGeometry'))
const RightEventDetail = lazy(() => import('./EventDetail'))
const TargetDetail = lazy(() => import('./TargetDetail'))

const route = {
  [RightModeEnum.DEVICE]: RightDeviceDetail,
  [RightModeEnum.SET_POINT]: RightAddPoint,
  [RightModeEnum.DRAW_GEOMETRY]: RightAddGeometry,
  [RightModeEnum.POINT_DETAIL]: OverlayDetail,
  [RightModeEnum.RANGING]: RightRangingPanel,
  [RightModeEnum.EVENT_DETAIL]: RightEventDetail,
  [RightModeEnum.RADAR_TARGET]: TargetDetail,
}

type PropsType = unknown

const Right: FC<PropsType> = memo(() => {
  const rightMode = useRightMode((s) => s.rightMode)
  const RightComponent = rightMode && route[rightMode]

  if (!RightComponent) {
    return <div className="p-3">404</div>
  }

  return (
    <div
      className={clsx(
        'absolute top-3 right-[54px] z-10',
        'bg-[#16202be6] rounded-[3px]',
        'border border-solid border-ground-5',
        'flex flex-col',
        'overflow-y-hidden',
      )}
      style={{ maxHeight: 'calc(100vh - 62px' }}
    >
      <AppViewSuspense>{<RightComponent key={rightMode} />}</AppViewSuspense>
    </div>
  )
})

Right.displayName = 'Right'

export default Right
