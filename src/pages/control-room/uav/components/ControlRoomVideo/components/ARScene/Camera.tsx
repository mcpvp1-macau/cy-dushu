import gimbalMap from '@/constant/uav/gimbal'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import useMixARStore from '@/store/control-room/useMixAR.store'
import useSettingStore from '@/store/useSetting.store'
import { calcFovRadiation } from '@/utils/fov'
import { isNil } from 'lodash'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = unknown

/** 更新相机 */
const ARSceneCamera: FC<PropsType> = memo(() => {
  const uav = useMixARStore((s) => s.uavProperties)
  // console.log(uav)
  // const uav = useUavControlRoomStore((s) => ({
  //   longitude: s.state.longitude,
  //   latitude: s.state.latitude,
  //   altitude: s.state.altitude,
  //   gimbalYaw: s.state.gimbalYaw,
  //   gimbalPitch: s.state.gimbalPitch,
  //   zoomFactor: s.state.zoomFactor,
  //   cameraType: 0,
  //   width: 1920,
  //   height: 1440,
  //   lensType: 0,
  // }))
  const { viewer } = useCesium()
  const shiftSetting = useSettingStore((s) => s.virtualReal.shift)

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
        // startInfo.startHeight + uav.altitude! - startInfo.startAGL,
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
      fov: calcFovRadiation(
        gimbalMap[uav.cameraType!]?.wide_focal ?? 4.5,
        gimbalMap[uav.cameraType!]?.wide_camera_w ?? 6.4,
        uav.lensType === 2 ? uav.zoomFactor : 1,
      ), // 75.17455291748047
      aspectRatio: (uav.width ?? 1) / (uav.height ?? 1),
      near: 0.1,
      far: 100000,
    })
  }, [uav, viewer])

  return null
})

ARSceneCamera.displayName = 'ARSceneCamera'

export default ARSceneCamera
