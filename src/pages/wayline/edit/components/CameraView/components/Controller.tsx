import { memo, useEffect, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useLatest } from 'ahooks'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { calcFov } from '@/utils/fov'

type PropsType = {
  viewType: 'wide' | 'narrow'
}

/** 摄像头视角控制器 */
const CameraController: FC<PropsType> = memo(({ viewType }) => {
  const uav = useAirlineConfigStore((s) => s.uav)
  const updateUav = useAirlineConfigStore((s) => s.updateUav)
  const cameraInfo = useAirlineConfigStore((s) => s.cameraInfo)
  const { viewer } = useCesium()

  const eoFovMultiplierLatest = useLatest(uav.eoFovMultiplier)
  const viewTypeLatest = useLatest(viewType)

  useEffect(() => {
    if (!viewer?.camera) {
      return
    }
    const { camera } = viewer

    viewer.scene.screenSpaceCameraController.enableTranslate = false
    viewer.scene.screenSpaceCameraController.enableTilt = false
    camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        uav.pointX ?? 120,
        uav.pointY ?? 30,
        uav.pointZ ?? 200,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(uav.eoHeading ?? 0),
        pitch: Cesium.Math.toRadians(uav.eoPitch ?? 0),
        roll: 0,
      },
    })
    if (
      viewer.scene.camera.frustum instanceof Cesium.PerspectiveFrustum &&
      cameraInfo
    ) {
      if (viewType === 'narrow') {
        viewer.scene.camera.frustum.fov = Cesium.Math.toRadians(
          calcFov(
            cameraInfo.focal,
            cameraInfo.sensorWidth,
            uav.eoFovMultiplier ?? 2,
          ) || 60,
        )
      } else {
        viewer.scene.camera.frustum.fov = Cesium.Math.toRadians(
          calcFov(cameraInfo.focal, cameraInfo.sensorWidth, 1) || 60,
        )
      }
    }
  }, [uav, viewType])

  useEffect(() => {
    if (!viewer?.camera) {
      return
    }
    // 创建一个 ScreenSpaceEventHandler 实例
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    const { camera } = viewer

    // 禁用默认的鼠标移动事件
    viewer.scene.screenSpaceCameraController.enableRotate = false
    viewer.scene.screenSpaceCameraController.enableZoom = false
    viewer.scene.screenSpaceCameraController.enableTilt = false
    viewer.scene.screenSpaceCameraController.enableLook = false

    // 鼠标灵敏度
    const mouseSensitivity = 0.1

    // 处理鼠标拖动事件
    let startMousePosition: Cesium.Cartesian2
    let mouseDown = false

    handler.setInputAction(
      (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        startMousePosition = Cesium.Cartesian2.clone(movement.position)
        mouseDown = true
      },
      Cesium.ScreenSpaceEventType.LEFT_DOWN,
    )

    handler.setInputAction(
      (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        if (!mouseDown) {
          return
        }

        const endMousePosition = movement.endPosition
        const deltaX = endMousePosition.x - startMousePosition.x
        const deltaY = endMousePosition.y - startMousePosition.y

        let sensitivity =
          (mouseSensitivity / (eoFovMultiplierLatest.current ?? 2)) * 4
        if (viewTypeLatest.current === 'wide') {
          sensitivity = mouseSensitivity * 2
        }

        camera.setView({
          orientation: {
            heading:
              camera.heading + Cesium.Math.toRadians(deltaX * sensitivity),
            pitch: camera.pitch - Cesium.Math.toRadians(deltaY * sensitivity),
            roll: 0,
          },
        })
        updateUav({
          eoHeading: Cesium.Math.toDegrees(camera.heading),
          eoPitch: Cesium.Math.toDegrees(camera.pitch),
        })

        startMousePosition = Cesium.Cartesian2.clone(endMousePosition)
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    )

    handler.setInputAction(function () {
      mouseDown = false
    }, Cesium.ScreenSpaceEventType.LEFT_UP)

    // 阻止鼠标滚轮缩放
    handler.setInputAction(function () {
      // 阻止默认行为
    }, Cesium.ScreenSpaceEventType.WHEEL)

    // 阻止触摸事件
    handler.setInputAction(function () {
      // 阻止默认行为
    }, Cesium.ScreenSpaceEventType.PINCH_START)

    handler.setInputAction(function () {
      // 阻止默认行为
    }, Cesium.ScreenSpaceEventType.PINCH_MOVE)

    return () => {
      handler.destroy()
    }
  }, [])

  return <></>
})

CameraController.displayName = 'CameraController'

export default CameraController
