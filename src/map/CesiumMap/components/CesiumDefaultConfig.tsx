import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useRafInterval } from 'ahooks'
import useMapSettingStore from '@/store/setting/useMapSetting.store'

import posz from '@/assets/imgs/sky-box/pz.jpg'
import negz from '@/assets/imgs/sky-box/nz.jpg'
import posx from '@/assets/imgs/sky-box/px.jpg'
import negx from '@/assets/imgs/sky-box/nx.jpg'
import posy from '@/assets/imgs/sky-box/py.jpg'
import negy from '@/assets/imgs/sky-box/ny.jpg'

type PropsType = unknown

const CesiumDefaultConfig: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()

  const resolution = useMapSettingStore((s) => s.resolution)

  useEffect(() => {
    if (!viewer) {
      return
    }
    if (viewer.cesiumWidget) {
      // @ts-ignore
      viewer.cesiumWidget._creditContainer.style.display = 'none'
    }

    viewer.scene.screenSpaceCameraController.inertiaZoom = 0

    // 限制地图相机的最大高度最小高度，防止找不到地球或者进入地下
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 18000000

    // @ts-ignore
    // viewer.scene.terrainProvider.isCreateSkirt = false // 关闭裙边

    viewer.scene.fog.enabled = false // 关闭雾效
    // viewer.scene.globe.showGroundAtmosphere = false // 关闭地球大气效果
    viewer.scene.highDynamicRange = false // 关闭 HDR
    // viewer.scene.fxaa = false // 关闭抗锯齿

    viewer.scene.globe.enableLighting = false // 关闭光照效果

    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    )

    // 是否开启抗锯齿
    // @ts-ignore
    // viewer.scene.fxaa = true
    // viewer.scene.postProcessStages.fxaa.enabled = true

    // 默认视角
    viewer.camera?.setView?.({
      destination: Cesium.Cartesian3.fromDegrees(110, 30, 18000000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: Cesium.Math.toRadians(0),
      },
    })

    // 添加背景图
    viewer.scene.skyBox = new Cesium.SkyBox({
      sources: {
        positiveZ: posz,
        negativeZ: negz,
        positiveX: posx,
        negativeX: negx,
        positiveY: negy,
        negativeY: posy,
      },
    })
  }, [viewer])

  useEffect(() => {
    if (!viewer) {
      return
    }
    if (resolution === '0') {
      viewer.resolutionScale = 0.8
    } else if (resolution === '1') {
      viewer.resolutionScale = 1
    } else if (resolution === '2') {
      viewer.resolutionScale = 1.2
    } else if (resolution === '3') {
      viewer.resolutionScale = 1.4
    } else if (resolution === '4') {
      viewer.resolutionScale = 1.7
    } else if (resolution === '5') {
      viewer.resolutionScale = 2
    }
  }, [resolution])

  useRafInterval(() => {
    if (!viewer) {
      return
    }
    try {
      viewer.scene.requestRender()
    } catch (error) {
      console.error(error)
    }
  }, 20)

  return null
})

CesiumDefaultConfig.displayName = 'CesiumDefaultConfig'

export default CesiumDefaultConfig
