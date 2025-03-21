import { memo, useRef, type FC } from 'react'
import { calcFov } from '@/utils/fov'
import Frustum from './Frustum'
import { useDeepCompareEffect } from 'ahooks'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { useCurrentAirpoint } from '@/store/wayline/uav-airline/select'

type PropsType = unknown

const EoFrustum: FC<PropsType> = () => {
  const uav = useAirlineConfigStore((s) => s.uav)
  const calcUavByCurrentAirpoint = useAirlineConfigStore(
    (s) => s.calcUavByCurrentAirpoint,
  )

  const currentAirpoint = useCurrentAirpoint()
  const currentActionIndex = useAirlineConfigStore((s) => s.currentActionIndex)
  const currentAction = currentAirpoint?.actions?.[currentActionIndex] ?? []
  const fovMultipiler = useAirlineConfigStore((s) => s.uav.eoFovMultiplier) ?? 2

  // 当前动作发生变化时，更新视场角
  useDeepCompareEffect(() => {
    calcUavByCurrentAirpoint()
  }, [currentAction])

  // 当前动作索引发生变化时，更新视场角
  const currentActionIndexRef = useRef(currentActionIndex)
  if (currentActionIndexRef.current !== currentActionIndex) {
    currentActionIndexRef.current = currentActionIndex
    calcUavByCurrentAirpoint()
  }

  const camera = useAirlineConfigStore((s) => s.cameraInfo)

  const { focal = 24, sensorHeight = 30, sensorWidth = 40 } = camera || {}

  const fov =
    focal && sensorWidth && fovMultipiler
      ? calcFov(focal, sensorWidth, fovMultipiler)
      : 20

  const aspectRadio =
    sensorWidth && sensorHeight ? sensorWidth / sensorHeight : 16 / 9

  return (
    <>
      {uav.pointX && uav.pointY && (
        <Frustum
          position={[uav.pointX, uav.pointY, uav.pointZ]}
          rotation={{
            x: 90 + (uav.eoPitch ?? 0),
            y: uav.eoHeading ?? 0,
            z: 0,
          }}
          aspectRatio={aspectRadio}
          color="#f97316"
          fov={fov}
          far={2000}
        />
      )}
    </>
  )
}

const memorizedCpn = memo(EoFrustum)
memorizedCpn.displayName = 'EoFrustum'

export default memorizedCpn
