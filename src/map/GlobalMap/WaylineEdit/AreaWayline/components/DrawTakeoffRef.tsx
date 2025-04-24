import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import image from '@/assets/imgs/takeoff-active.ea7a1012.svg'
import { attempt } from 'lodash'

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
        const ray = viewer.camera.getPickRay(e.position)
        if (!ray) {
          return
        }
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!cartesian) {
          return
        }
        // 地形上的点
        const geo = Cesium.Cartographic.fromCartesian(cartesian)
        const geoDegrees = {
          longitude: Cesium.Math.toDegrees(geo.longitude),
          latitude: Cesium.Math.toDegrees(geo.latitude),
          height: geo.height,
        }

        updateAirlineConfig({
          ...useAreaWaylineStore.getState().airlineConfig,
          takeOffRefPoint: [geoDegrees.longitude, geoDegrees.latitude, 0],
        })
        updateIsDrawHome(false)
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
