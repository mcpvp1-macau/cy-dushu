import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import image from '@/assets/imgs/takeoff-active.ea7a1012.svg'
import { attempt, round } from 'lodash'
import { cartesian3ToDegrees } from '@/utils/geo-math'

type PropsType = unknown

const DrawTakeoffRef: FC<PropsType> = memo(() => {
  const isDrawHome = useAreaWaylineStore((s) => s.isDrawHome)
  const takeoffRefPoint = useAreaWaylineStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const updateAirlineConfig = useAreaWaylineStore((e) => e.updateAirlineConfig)
  const updateIsDrawHome = useAreaWaylineStore((e) => e.updateIsDrawHome)

  const { viewer } = useCesium()
  // 绘制起飞点
  useEffect(() => {
    if (!viewer) {
      return
    }
    if (!takeoffRefPoint) {
      return
    }
    const e = viewer.entities.add({
      billboard: {
        image,
        height: 32,
        width: 32,
        disableDepthTestDistance: 10000,
      },
      position: Cesium.Cartesian3.fromDegrees(
        takeoffRefPoint[0],
        takeoffRefPoint[1],
        takeoffRefPoint[2],
      ),
    })

    // 添加鼠标点击事件监听器
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction((movement) => {
      // 检测点击位置的对象
      const pickedObject = viewer.scene.pick(movement.position)

      if (Cesium.defined(pickedObject) && pickedObject.id === e) {
        // 如果是目标 Entity
        // alert('你点击了测试点！')
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

    return () => {
      attempt(() => {
        viewer.entities.remove(e)
      })
    }
  }, [viewer, takeoffRefPoint])

  // 处理设置起飞点
  useEffect(() => {
    if (!isDrawHome || !viewer?.scene) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickResults = viewer.scene.drillPick(e.position)

        let is3dPick = false
        pickResults.forEach((item) => {
          if (item.primitive instanceof Cesium.Cesium3DTileset) {
            is3dPick = true
          }
        })

        requestAnimationFrame(() => {
          let position: Cesium.Cartesian3 | undefined
          if (is3dPick) {
            position = viewer.scene.pickPosition(e.position)
          } else {
            const ray = viewer.camera.getPickRay(e.position)
            position = ray
              ? viewer.scene.globe.pick(ray, viewer.scene)
              : undefined
          }
          if (!position) {
            return
          }
          const geo = cartesian3ToDegrees(position)

          const geoDegrees = {
            longitude: Cesium.Math.toDegrees(geo[0]),
            latitude: Cesium.Math.toDegrees(geo[1]),
            height: round(geo[2], 4) + 0.05,
          }

          updateAirlineConfig({
            ...useAreaWaylineStore.getState().airlineConfig,
            takeOffRefPoint: [
              geoDegrees.longitude,
              geoDegrees.latitude,
              geoDegrees.height,
            ],
          })
          updateIsDrawHome(false)
        })
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )

    return () => {
      handler.destroy()
    }
  }, [isDrawHome])

  return null
})

DrawTakeoffRef.displayName = 'DrawTakeoffRef'

export default DrawTakeoffRef
