import { useRafInterval } from 'ahooks'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import useMixARStore from '@/store/control-room/useMixAR.store'

type PropsType = unknown

const ARSceneConfig: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()

  const updateCeisumViewer = useMixARStore((s) => s.updateCeisumViewer)

  useEffect(() => {
    updateCeisumViewer(viewer ?? null)
    return () => {
      updateCeisumViewer(null)
    }
  }, [viewer])

  useEffect(() => {
    if (!viewer) {
      return
    }
    if (viewer.cesiumWidget) {
      // @ts-ignore
      viewer.cesiumWidget._creditContainer.style.display = 'none'
    }

    viewer.scene.screenSpaceCameraController.inertiaZoom = 0

    // @ts-ignore
    // viewer.scene.terrainProvider.isCreateSkirt = false // 关闭裙边

    viewer.scene.fog.enabled = false // 关闭雾效
    viewer.scene.globe.showGroundAtmosphere = false // 关闭地球大气效果
    viewer.scene.highDynamicRange = false // 关闭 HDR
    // viewer.scene.fxaa = false // 关闭抗锯齿

    viewer.scene.globe.show = false
    viewer.scene.skyAtmosphere.show = false

    viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT

    viewer.scene.postProcessStages.fxaa.enabled = true
    viewer.scene.msaaSamples = 8

    // viewer.scene.fxaa = true // 启用抗锯齿，间接启用 OIT

    // 是否开启抗锯齿
    // @ts-ignore
    // viewer.scene.fxaa = true
    // viewer.scene.postProcessStages.fxaa.enabled = true

    // 禁用深度检测
    viewer.scene.globe.depthTestAgainstTerrain = false

    // 设置分辨率
    // viewer.resolutionScale = 2
  }, [viewer])

  useRafInterval(() => {
    if (!viewer) {
      return
    }
    viewer.scene.requestRender()
  }, 100)
  return null
})

ARSceneConfig.displayName = 'ARSceneConfig'

export default ARSceneConfig
