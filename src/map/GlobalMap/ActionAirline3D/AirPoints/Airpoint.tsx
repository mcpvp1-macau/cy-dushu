import { useEffect, useRef, memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import * as turf from '@turf/turf'
import { useAirpointEntity } from './hooks/useAirpointEntity'
import { useLatest } from 'ahooks'
import { emiter } from '../hooks/useMouseStyle'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { AirpointsConfigItem } from '@/store/uav/uav-airline/types'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { get3DTan } from '@/utils/geo-math'
import { wgs84ToDrawingBufferCoordinates } from '@/utils/cesium/sence-transform'

type PropsType = {
  point: AirpointsConfigItem
}

const Airpoint: FC<PropsType> = ({ point }) => {
  const { viewer } = useCesium()

  const currentIndex = useAirlineConfigStore((s) => s.currentIndex)
  const setCurrentIndex = useAirlineConfigStore((s) => s.updateCurrentIndex)
  const editCurrentAirPoint = useAirlineConfigStore(
    (s) => s.updateCurrentAirpoint,
  )
  const calcUavByCurrentAirpoint = useAirlineConfigStore(
    (s) => s.calcUavByCurrentAirpoint,
  )

  const entityRef = useAirpointEntity(point, currentIndex)
  const pointRef = useLatest(point)
  const currentIndexRef = useLatest(currentIndex)

  // 点击事件的处理
  useEffect(() => {
    if (!viewer?.scene) return

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    // 点击事件
    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = viewer.scene.pick(e.position)
        if (
          !pickedObject ||
          !pickedObject.id ||
          entityRef.current !== pickedObject.id
        ) {
          return
        }
        setCurrentIndex(pointRef.current.positionIndex ?? 0)
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )

    return () => {
      handler.destroy()
    }
  }, [])

  const move = useRef(false)
  const altMove = useRef(false)

  useEffect(() => {
    if (!viewer?.scene || !entityRef.current) {
      return
    }
    if (currentIndex !== pointRef.current.positionIndex) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    // 鼠标移入事件
    handler.setInputAction((e: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      const endPosition = viewer.scene.pickPosition(e.endPosition)
      if (!move.current) {
        return
      }

      // 获取地理坐标
      const cartesian = viewer.scene.camera.pickEllipsoid(
        e.endPosition,
        viewer.scene.globe.ellipsoid,
      )

      if (!Cesium.defined(cartesian)) return
      const x = cartesian3ToDegrees(cartesian!)
      const y = cartesian3ToDegrees(viewer.scene.camera.position)
      const target = cartesian3ToDegrees(
        entityRef.current!.position!.getValue(viewer.clock.currentTime)!,
      )
      const distance = target[2] / get3DTan(x, y)
      const bearing = turf.bearing(
        turf.point([x[0], x[1]]),
        turf.point([y[0], y[1]]),
      )

      const dest = turf.rhumbDestination(
        turf.point([x[0], x[1]]),
        distance,
        bearing,
      )
      if (Cesium.defined(endPosition)) {
        editCurrentAirPoint({
          pointX: dest.geometry.coordinates[0],
          pointY: dest.geometry.coordinates[1],
          pointZ: target[2],
        })
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    return () => {
      handler.destroy()
    }
  }, [currentIndex])

  useEffect(() => {
    if (!viewer?.scene || !entityRef.current) {
      return
    }
    if (currentIndex !== pointRef.current.positionIndex) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    // 鼠标移入事件
    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        const pickedObject = viewer.scene.pick(e.endPosition)
        if (
          !pickedObject ||
          !pickedObject.id ||
          !pickedObject.id.position ||
          entityRef.current !== pickedObject.id
        ) {
          viewer.scene.canvas.style.cursor = 'default'
        } else {
          viewer.scene.canvas.style.cursor = 'ns-resize'
        }

        if (!altMove.current) {
          return
        }

        let low = 100,
          high = 500.01
        while (high - low >= 0.01) {
          const mid = (low + high) / 2
          const pos = wgs84ToDrawingBufferCoordinates(
            viewer.scene,
            Cesium.Cartesian3.fromDegrees(
              pointRef.current.pointX,
              pointRef.current.pointY,
              mid,
            ),
          )!
          if (pos.y < e.endPosition.y) {
            high = mid
          } else {
            low = mid
          }
        }
        editCurrentAirPoint({
          pointZ: low,
        })
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
      Cesium.KeyboardEventModifier.ALT,
    )

    return () => {
      handler.destroy()
    }
  }, [currentIndex])

  useEffect(() => {
    if (!viewer?.scene) return
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    // 鼠标按下事件
    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = viewer.scene.pick(e.position)
        if (
          !pickedObject ||
          !pickedObject.id ||
          entityRef.current !== pickedObject.id
        ) {
          return
        }
        if (currentIndexRef.current !== pointRef.current.positionIndex) {
          return
        }
        move.current = true
        emiter.emit('move', true)
        //锁定相机
        viewer.scene.screenSpaceCameraController.enableRotate = false
        viewer.scene.screenSpaceCameraController.enableTranslate = false
      },
      Cesium.ScreenSpaceEventType.LEFT_DOWN,
    )

    // 鼠标按下事件
    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = viewer.scene.pick(e.position)
        if (
          !pickedObject ||
          !pickedObject.id ||
          entityRef.current !== pickedObject.id
        ) {
          return
        }
        altMove.current = true
        //锁定相机
        viewer.scene.screenSpaceCameraController.enableRotate = false
        viewer.scene.screenSpaceCameraController.enableTranslate = false
      },
      Cesium.ScreenSpaceEventType.LEFT_DOWN,
      Cesium.KeyboardEventModifier.ALT,
    )

    // 鼠标抬起事件
    handler.setInputAction(() => {
      if (move.current) {
        calcUavByCurrentAirpoint()
      }
      move.current = false
      altMove.current = false
      emiter.emit('move', false)

      viewer.scene.screenSpaceCameraController.enableRotate = true
      viewer.scene.screenSpaceCameraController.enableTranslate = true
    }, Cesium.ScreenSpaceEventType.LEFT_UP)

    // 鼠标抬起事件
    handler.setInputAction(
      () => {
        if (altMove.current) {
          calcUavByCurrentAirpoint()
        }
        move.current = false
        altMove.current = false
        viewer.scene.screenSpaceCameraController.enableRotate = true
        viewer.scene.screenSpaceCameraController.enableTranslate = true
      },
      Cesium.ScreenSpaceEventType.LEFT_UP,
      Cesium.KeyboardEventModifier.ALT,
    )

    return () => {
      handler.destroy()
    }
  }, [])

  return <></>
}

export default memo(Airpoint)
