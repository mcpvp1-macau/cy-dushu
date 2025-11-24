import gimbalMap from '@/constant/uav/gimbal'
import useMixARStore, { GimbalPick } from '@/store/control-room/useMixAR.store'
import { calcFovRadiation } from '@/utils/fov'
import { isNil } from 'lodash'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import useARSettingStore from '@/store/setting/useARSetting.store'
import { limitNum } from '@/utils/math'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useShallow } from 'zustand/react/shallow'
import { getGimbalInfo, calcCameraParameters } from '@/constant/uav/gimbalV2'

type PropsType = unknown

/** 更新相机 */
const ARSceneCamera: FC<PropsType> = memo(() => {
  const uav = useMixARStore((s) => s.uavProperties)
  const latestUavUpdateTime = useRef(Date.now())
  const uav2 = useUavControlRoomStore(
    useShallow((s) => ({
      longitude: s.state.longitude ?? 0,
      latitude: s.state.latitude ?? 0,
      altitude: s.state.altitude ?? 0,
      gimbalYaw: s.state.gimbalHead ?? 0,
      gimbalPitch: s.state.gimbalPitch ?? 0,
      lensType: s.state.lensType,
      zoomFactor: s.state.zoomFactor ?? 1,
      cameraType: s.state.gimbalType || s.state.cameraType,
      uavYaw: s.state.uavYaw ?? 0,
    })),
  )

  useEffect(() => {
    latestUavUpdateTime.current = Date.now()
  }, [uav])

  // 0.5s内视频流都没更新，则使用DRC链路的数据
  const uavProperty = useMemo(() => {
    if (Date.now() - latestUavUpdateTime.current < 1000 * 0.5) {
      return {
        ...uav,
        fov: limitNum(
          calcFovRadiation(
            gimbalMap[uav.cameraType!]?.wide_focal ?? 4.5,
            gimbalMap[uav.cameraType!]?.wide_camera_w ?? 6.4,
            uav.lensType === 2 ? uav.zoomFactor || 1 : 1,
          ),
          0,
          Math.PI - 1e-6,
        ),
      }
    }
    const gimbalInfo = getGimbalInfo(uav2.cameraType || '')
    const cameraParams = calcCameraParameters(
      gimbalInfo,
      uav2.lensType,
      uav2.lensType === 'zoom' ? uav2.zoomFactor || 1 : 1,
    )
    return {
      ...uav2,
      width: cameraParams.width,
      height: cameraParams.height,
      fov: limitNum(
        calcFovRadiation(
          gimbalInfo.wide.focal ?? 4.5,
          gimbalInfo.wide.width ?? 6.4,
          uav2.lensType === 'zoom' ? uav2.zoomFactor || 1 : 1,
        ),
        0,
        Math.PI - 1e-6,
      ),
    }
  }, [uav, uav2])

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
      !uavProperty.longitude ||
      !uavProperty.latitude ||
      !uavProperty.altitude ||
      isNil(uavProperty.gimbalYaw) ||
      isNil(uavProperty.gimbalPitch) ||
      isNil(uavProperty.zoomFactor)
    ) {
      return
    }

    const camera = viewer.camera
    camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        uavProperty.longitude,
        uavProperty.latitude,
        uavProperty.altitude! + shiftSetting.height,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(
          uavProperty.gimbalYaw + shiftSetting.gimbalYaw,
        ),
        pitch: Cesium.Math.toRadians(
          uavProperty.gimbalPitch + shiftSetting.gimbalPitch,
        ),
        roll: Cesium.Math.toRadians(0),
      },
    })
    camera.frustum = new Cesium.PerspectiveFrustum({
      fov: uavProperty.fov,
      aspectRatio: (uavProperty.width ?? 1) / (uavProperty.height ?? 1),
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
  }, [uavProperty, shiftSetting, viewer])

  return null
})

ARSceneCamera.displayName = 'ARSceneCamera'

export default ARSceneCamera
