import gimbalMap from '@/constant/uav/gimbal'
import useMixARStore, { GimbalPick } from '@/store/control-room/useMixAR.store'
import { calcFovRadiation } from '@/utils/fov'
import { isNil } from 'lodash'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import useARSettingStore from '@/store/setting/useARSetting.store'
import { limitNum } from '@/utils/math'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

type PropsType = unknown

/** 更新相机 */
const ARSceneCamera: FC<PropsType> = memo(() => {
  const uav = useMixARStore((s) => s.uavProperties)
  const { viewer } = useCesium()
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const shiftSetting = useARSettingStore(
    (s) =>
      s.shift[deviceId] ?? {
        gimbalYaw: 0,
        gimbalPitch: 0,
        height: 0,
        lng: 0,
        lat: 0,
      },
  )

  const updateGimbalPick = useMixARStore((s) => s.updateGimbalPick)

  useEffect(() => {
    if (!viewer?.camera) {
      return
    }

    if (
      !uav.longitude ||
      !uav.latitude ||
      !uav.altitude ||
      isNil(uav.gimbalYaw) ||
      isNil(uav.gimbalPitch) ||
      isNil(uav.zoomFactor)
    ) {
      return
    }

    const camera = viewer.camera
    camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        uav.longitude,
        uav.latitude,
        uav.altitude! + shiftSetting.height,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(uav.gimbalYaw + shiftSetting.gimbalYaw),
        pitch: Cesium.Math.toRadians(
          uav.gimbalPitch + shiftSetting.gimbalPitch,
        ),
        roll: Cesium.Math.toRadians(0),
      },
    })
    camera.frustum = new Cesium.PerspectiveFrustum({
      fov: limitNum(
        calcFovRadiation(
          gimbalMap[uav.cameraType!]?.wide_focal ?? 4.5,
          gimbalMap[uav.cameraType!]?.wide_camera_w ?? 6.4,
          uav.lensType === 2 ? uav.zoomFactor : 1,
        ),
        0,
        Math.PI - 1e-6,
      ),
      aspectRatio: (uav.width ?? 1) / (uav.height ?? 1),
      near: 0.1,
      far: 10000,
    })

    // 获取相机四个角的经纬度 ---------------------
    const frustum = camera.frustum as Cesium.PerspectiveFrustum
    const tanFovY = Math.tan(camera.frustum.fovy! / 2)
    const aspectRatio = frustum.aspectRatio
    const tanFovX = tanFovY * aspectRatio!
    const cameraDirection = Cesium.Cartesian3.clone(camera.direction)
    const cameraRight = Cesium.Cartesian3.clone(camera.right)
    const cameraUp = Cesium.Cartesian3.clone(camera.up)

    const directionTuples = [
      ['leftBottom', -tanFovX, -tanFovY],
      ['rightBottom', tanFovX, -tanFovY],
      ['leftTop', -tanFovX, tanFovY],
      ['rightTop', tanFovX, tanFovY],
    ] as const

    const calcDirection = (fovX: number, fovY: number) =>
      Cesium.Cartesian3.add(
        Cesium.Cartesian3.multiplyByScalar(
          cameraDirection,
          1.0,
          new Cesium.Cartesian3(),
        ),
        Cesium.Cartesian3.add(
          Cesium.Cartesian3.multiplyByScalar(
            cameraUp,
            fovY,
            new Cesium.Cartesian3(),
          ),
          Cesium.Cartesian3.multiplyByScalar(
            cameraRight,
            fovX,
            new Cesium.Cartesian3(),
          ),
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      )

    // 视锥四个角的经纬度
    const gimbalPick: GimbalPick = {}

    for (const [key, fovX, fovY] of directionTuples) {
      let lowFovY = -Math.abs(fovY)
      let highFovY = fovY

      while (lowFovY + 0.001 < highFovY) {
        const y = (lowFovY + highFovY) / 2
        const direction = calcDirection(fovX, y)

        const ray = new Cesium.Ray(camera.position, direction)
        const intersection = Cesium.IntersectionTests.rayEllipsoid(
          ray,
          viewer.scene.globe.ellipsoid,
        )
        if (Cesium.defined(intersection)) {
          lowFovY = y
        } else {
          highFovY = y
        }
      }

      const direction = calcDirection(fovX, lowFovY)
      const ray = new Cesium.Ray(camera.position, direction)
      const intersection = Cesium.IntersectionTests.rayEllipsoid(
        ray,
        viewer.scene.globe.ellipsoid,
      )
      if (Cesium.defined(intersection)) {
        const point = Cesium.Ray.getPoint(ray, intersection.start)
        const cartographic =
          viewer.scene.globe.ellipsoid.cartesianToCartographic(point)
        const lon = Cesium.Math.toDegrees(cartographic.longitude)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        gimbalPick[key] = [lon, lat]
      }
    }

    updateGimbalPick(gimbalPick)
  }, [uav, viewer])

  return null
})

ARSceneCamera.displayName = 'ARSceneCamera'

export default ARSceneCamera
