import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useLatest } from 'ahooks'
import { emiter } from '../../hooks/useMouseStyle'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'
import { RebotDogWaypointConfigType } from '@/store/wayline/rebot-dog-wayline/types'
import { useWaypointEntity } from './useWaypointEntity'

type PropsType = {
  point: RebotDogWaypointConfigType
}

const Waypoint: FC<PropsType> = ({ point }) => {
  const { viewer } = useCesium()

  const currentIndex = useRebotDogWaylineStore((s) => s.currentIndex)
  const setCurrentIndex = useRebotDogWaylineStore((s) => s.updateCurrentIndex)
  const editCurrentAirPoint = useRebotDogWaylineStore(
    (s) => s.updateCurrentWaypoint,
  )

  const entityRef = useWaypointEntity(point, currentIndex)
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

      const dest = cartesian3ToDegrees(cartesian!)

      if (Cesium.defined(endPosition)) {
        editCurrentAirPoint({
          pointX: dest[0],
          pointY: dest[1],
          pointZ: dest[2],
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

    // 鼠标抬起事件
    handler.setInputAction(() => {
      move.current = false
      altMove.current = false
      emiter.emit('move', false)

      viewer.scene.screenSpaceCameraController.enableRotate = true
      viewer.scene.screenSpaceCameraController.enableTranslate = true
    }, Cesium.ScreenSpaceEventType.LEFT_UP)

    return () => {
      handler.destroy()
    }
  }, [])

  return null
}

export default memo(Waypoint)
