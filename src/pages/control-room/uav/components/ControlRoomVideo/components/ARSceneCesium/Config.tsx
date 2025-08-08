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

    if (viewer.scene.sun !== undefined) {
      viewer.scene.sun.show = false
    }
    if (viewer.scene.moon !== undefined) {
      viewer.scene.moon.show = false
    }
    if (viewer.scene.globe !== undefined) {
      viewer.scene.globe.show = false
    }
    if (viewer.scene.skyAtmosphere !== undefined) {
      viewer.scene.skyAtmosphere.show = false
    }
    viewer.scene.skyAtmosphere.brightnessShift = -0.0
    if (viewer.scene.skyBox !== undefined) {
      viewer.scene.skyBox.show = false
    }
    if (viewer.scene.fog !== undefined) {
      viewer.scene.fog.enabled = false
    }
    if (viewer.scene.shadowMap !== undefined) {
      viewer.scene.shadowMap.enabled = false
    }
    viewer.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0)

    // 重采样抗锯齿
    viewer.scene.msaaSamples = 4

    // 禁用深度检测
    viewer.scene.globe.depthTestAgainstTerrain = false

    viewer.resolutionScale = window.devicePixelRatio
  }, [viewer])

  useEffect(() => {
    const handleResize = () => {
      if (!viewer) {
        return
      }
      viewer.resolutionScale = window.devicePixelRatio
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
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
