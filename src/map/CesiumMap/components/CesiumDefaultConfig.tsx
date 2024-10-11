import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = unknown

const CesiumDefaultConfig: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  useEffect(() => {
    if (!viewer) {
      return
    }
    if (viewer.cesiumWidget) {
      // @ts-ignore
      viewer.cesiumWidget._creditContainer.style.display = 'none'
    }

    // 限制地图相机的最大高度最小高度，防止找不到地球或者进入地下
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 18000000

    // @ts-ignore
    viewer.scene.terrainProvider.isCreateSkirt = false // 关闭裙边

    // 是否开启抗锯齿
    // @ts-ignore
    viewer.scene.fxaa = true
    viewer.scene.postProcessStages.fxaa.enabled = true

    // 设备分辨率比例，防止部分电脑过于模糊
    const supportsImageRenderingPixelated =
      // @ts-ignore
      viewer.cesiumWidget._supportsImageRenderingPixelated
    let vtxf_dpr = window.devicePixelRatio
    if (supportsImageRenderingPixelated) {
      while (vtxf_dpr >= 2.0) {
        vtxf_dpr /= 2.0
      }
    }

    viewer.camera?.setView?.({
      destination: Cesium.Cartesian3.fromDegrees(110, 30, 18000000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: Cesium.Math.toRadians(0),
      },
    })

    // 亮度设置
    const stages = viewer.scene.postProcessStages
    // @ts-ignore
    viewer.scene.brightness =
      // @ts-ignore
      viewer.scene.brightness ||
      stages.add(Cesium.PostProcessStageLibrary.createBrightnessStage())
    // @ts-ignore
    viewer.scene.brightness.enabled = true
    // @ts-ignore
    viewer.scene.brightness.uniforms.brightness = Number(1)
  }, [viewer])

  return null
})

CesiumDefaultConfig.displayName = 'CesiumDefaultConfig'

export default CesiumDefaultConfig
