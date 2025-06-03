import AppViewSuspense from '@/components/AppViewSuspense'
import { RightModeEnum } from '@/enum/right-mode'
import { useUavControlRoomLayoutStore } from '@/pages/control-room/uav/hooks/useUavControlRoomLayout.store'
import { lazy } from 'react'

const RightAddPoint = lazy(() => import('@/pages/right/right-tools/AddPoint'))
const RightAddGeometry = lazy(
  () => import('@/pages/right/right-tools/AddGeometry'),
)
const RightRangingPanel = lazy(
  () => import('@/pages/right/right-tools/Ranging'),
)

const route = {
  [RightModeEnum.SET_POINT]: RightAddPoint,
  [RightModeEnum.DRAW_GEOMETRY]: RightAddGeometry,
  [RightModeEnum.RANGING]: RightRangingPanel,
}

type PropsType = unknown

const Right: FC<PropsType> = memo(() => {
  const rightMode = useUavControlRoomLayoutStore((s) => s.mapRight)
  const updateMapRight = useUavControlRoomLayoutStore((s) => s.updateMapRight)

  if (!rightMode) {
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
        'bg-[#16202be6] rounded-[3px]',
        'border border-solid border-ground-5',
        'flex flex-col',
        'overflow-y-hidden',
      )}
      style={{ maxHeight: 'calc(100vh - 100px' }}
    >
      <AppViewSuspense>
        {
          <RightComponent
            key={rightMode}
            onClose={() => updateMapRight(null)}
          />
        }
      </AppViewSuspense>
    </div>
  )
})

Right.displayName = 'Right'

export default Right
