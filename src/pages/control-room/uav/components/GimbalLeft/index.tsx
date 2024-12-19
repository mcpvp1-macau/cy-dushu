import { lazy, memo, Suspense, type FC } from 'react'
import GimbalSwitch from './GimbalSwitch'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

const ExposureValue = lazy(() => import('./ExposureValue'))

type PropsType = unknown

const GimbalLeft: FC<PropsType> = memo(() => {
  const hasExposureSet = useDeviceDetailStore(
    (s) => s.serviceHave['cameraExposureValueSet'],
  )

  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
      <GimbalSwitch />
      {hasExposureSet && (
        <Suspense fallback={null}>
          <ExposureValue />
        </Suspense>
      )}
    </div>
  )
})

GimbalLeft.displayName = 'GimbalLeft'

export default GimbalLeft
