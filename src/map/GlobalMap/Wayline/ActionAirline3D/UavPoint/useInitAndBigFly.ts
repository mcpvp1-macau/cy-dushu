import * as Cesium from 'cesium'
import { useCesium } from 'resium'
import { useEffect } from 'react'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { useCurrentAirpoint } from '@/store/uav/uav-airline/select'

const flyTo = (camera: Cesium.Camera, target: Cesium.Cartesian3) => {
  const distanceToTarget = 2000
  camera?.lookAt(
    target,
    new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(0),
      Cesium.Math.toRadians(-30),
      distanceToTarget,
    ),
  )
  // 取消目标锁定
  camera?.lookAtTransform(Cesium.Matrix4.IDENTITY)
}

export const useInitAndBigFly = () => {
  const { viewer } = useCesium()

  const airPointSize = useAirlineConfigStore((s) => s.airpointsConfig.length)
  const currentAirPoint = useCurrentAirpoint()
  const takeOffRefPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const takeOffSecurityHeight = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffSecurityHeight,
  )
  const currentBearing = useAirlineConfigStore((s) => s.bearing)
  const cpUav = useAirlineConfigStore((s) => s.calcUavByCurrentAirpoint)
  const setUav = useAirlineConfigStore((s) => s.updateUav)

  useEffect(() => {
    // 如果存在航点
    if (airPointSize > 0) {
      cpUav()
      if (currentAirPoint && currentAirPoint.pointX) {
        const targetPosition = Cesium.Cartesian3.fromDegrees(
          currentAirPoint.pointX,
          currentAirPoint.pointY,
          currentAirPoint.pointZ,
        )
        if (viewer?.camera) {
          flyTo(viewer?.camera, targetPosition)
        }
      }
    } else if (
      takeOffRefPoint &&
      Array.isArray(takeOffRefPoint) &&
      takeOffRefPoint.length > 0
    ) {
      setUav({
        pointX: takeOffRefPoint[0],
        pointY: takeOffRefPoint[1],
        pointZ: takeOffSecurityHeight,
        actions: [],
        eoHeading: 0,
        eoPitch: 0,
        eoRoll: 0,
        xid: 'home',
        uavHeading: currentBearing,
        eoFovMultiplier: 5,
      })
      if (viewer?.camera) {
        flyTo(
          viewer?.camera,
          Cesium.Cartesian3.fromDegrees(
            takeOffRefPoint[0],
            takeOffRefPoint[1],
            takeOffSecurityHeight,
          ),
        )
      }
    }
  }, [])
}
