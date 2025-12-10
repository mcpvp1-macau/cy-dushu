import { memo, useEffect, useRef, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import image from '@/assets/imgs/takeoff-active.ea7a1012.svg'
import { emiter } from '../hooks/useMouseStyle'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { cartesian3ToDegrees } from '@/utils/geoUtils'

type PropsType = unknown

const HomePoint: FC<PropsType> = () => {
  const isDrawHome = useAirlineConfigStore((s) => s.isDrawHome)
  const setIsDrawHome = useAirlineConfigStore((s) => s.updateIsDrawHome)
  const airlineConfig = useAirlineConfigStore((s) => s.airlineConfig)
  const setAirlineConfig = useAirlineConfigStore((s) => s.updateAirlineConfig)
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) return
    if (!isDrawHome) {
      viewer.scene.canvas.style.cursor = 'default'
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

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

          // const geoDegrees = {
          //   longitude: Cesium.Math.toDegrees(geo[0]),
          //   latitude: Cesium.Math.toDegrees(geo[1]),
          //   height: round(geo[2], 4) + 0.05,
          // }

          setAirlineConfig({
            ...useAirlineConfigStore.getState().airlineConfig,
            takeOffRefPoint: geo,
          })

          setIsDrawHome(false)
        })

        // const ray = viewer.camera.getPickRay(e.position)
        // if (!ray) return
        // const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        // if (!cartesian) return
        // // 地形上的点
        // const geo = cartesian3ToDegrees(cartesian)

        // setAirlineConfig({
        //   ...useAirlineConfigStore.getState().airlineConfig,
        //   takeOffRefPoint: geo,
        // })

        // 设置相机位置
        // viewer.camera?.lookAt(
        //   cartesian,
        //   new Cesium.HeadingPitchRange(
        //     Cesium.Math.toRadians(0),
        //     Cesium.Math.toRadians(-30),
        //     1200,
        //   ),
        // )
        // 取消目标锁定
        // viewer.camera?.lookAtTransform(Cesium.Matrix4.IDENTITY)

        // viewer.scene.screenSpaceCameraController.enableRotate = true

        setIsDrawHome(false)
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )

    return () => {
      handler.destroy()
    }
  }, [isDrawHome])

  const { takeOffRefPoint } = airlineConfig
  const entityRef = useRef<Cesium.Entity | null>(null)
  const move = useRef(false)

  useEffect(() => {
    if (!viewer) return
    if (!airlineConfig.takeOffRefPoint) return

    // 添加起飞点
    entityRef.current = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        takeOffRefPoint![0],
        takeOffRefPoint![1],
        takeOffRefPoint![2],
      ),
      billboard: {
        image: image,
        height: 32,
        width: 32,
        disableDepthTestDistance: 10000,
      },
      properties: {
        xtype: 'takeoff',
      },
    })

    return () => {
      if (entityRef.current) {
        try {
          viewer?.entities?.remove(entityRef.current)
        } catch (_error) {}
      }
    }
  }, [takeOffRefPoint])

  useEffect(() => {
    if (!viewer?.scene) return
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction((e: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      if (!move.current) {
        return
      }

      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      const geo = cartesian3ToDegrees(cartesian)

      setAirlineConfig({
        ...useAirlineConfigStore.getState().airlineConfig,
        takeOffRefPoint: geo,
      })
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = viewer.scene.pick(e.position)
        if (
          !pickedObject ||
          !pickedObject.id ||
          !pickedObject.id.position ||
          entityRef.current !== pickedObject.id
        ) {
          return
        }
        emiter.emit('move', true)
        move.current = true

        //锁定相机
        viewer.scene.screenSpaceCameraController.enableRotate = false
      },
      Cesium.ScreenSpaceEventType.LEFT_DOWN,
    )

    handler.setInputAction(() => {
      move.current = false
      emiter.emit('move', false)

      // 取消相机锁定
      viewer.scene.screenSpaceCameraController.enableRotate = true
    }, Cesium.ScreenSpaceEventType.LEFT_UP)

    return () => {
      handler.destroy()
    }
  }, [])

  return <></>
}

export default memo(HomePoint)
