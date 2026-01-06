import * as Cesium from 'cesium'
import { useCesium } from 'resium'
import { useDebounceFn } from 'ahooks'
import { useSmartCarControlRoomStore } from '@/store/context-store/useSmartCarControlRoom.store'
import { attempt, isNil } from 'lodash'

/** 视角回调（智慧警车视角回中） */
const SmartCarViewCombackResolver: FC = memo(() => {
  const { viewer } = useCesium()
  const canFly = useRef(true)

  const lng = useSmartCarControlRoomStore((s) => s.state.longitude)
  const lat = useSmartCarControlRoomStore((s) => s.state.latitude)
  const mapViewLocked = useSmartCarControlRoomStore((s) => s.lockSmartCarMapView)
  const hasInitFly = useRef(false)

  const bigFly = useMemoizedFn((alt?: number) => {
    if (
      !viewer?.scene ||
      !mapViewLocked ||
      !canFly.current ||
      isNil(lng) ||
      isNil(lat)
    ) {
      return
    }

    const currentHeight = alt ?? viewer.camera?.positionCartographic?.height
    if (isNil(currentHeight)) {
      return
    }

    // 业务规则：锁定时保持顶视图，并使用当前高度追踪智慧警车位置
    viewer.scene.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, currentHeight),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
      },
    })
  })

  const { run: comeBack } = useDebounceFn(
    () => {
      canFly.current = true
      bigFly()
    },
    {
      leading: false,
      wait: 5_000,
    },
  )

  useEffect(() => {
    if (!viewer?.scene || !mapViewLocked) return

    // 边拖拽/缩放边暂时关闭跟随，结束后一段时间再自动回中
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    let isDrag = false

    handler.setInputAction(() => {
      isDrag = true
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

    handler.setInputAction(() => {
      if (isDrag) {
        canFly.current = false
        comeBack()
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(() => {
      canFly.current = false
      comeBack()
    }, Cesium.ScreenSpaceEventType.WHEEL)

    handler.setInputAction(() => {
      isDrag = false
    }, Cesium.ScreenSpaceEventType.LEFT_UP)

    return () => {
      attempt(() => {
        handler.destroy()
      })
    }
  }, [comeBack, mapViewLocked, viewer])

  useEffect(() => {
    if (!viewer?.scene || !mapViewLocked || hasInitFly.current) return

    if (isNil(lng) || isNil(lat)) {
      return
    }

    // 业务规则：地图初始化完成后默认飞到智慧警车位置，避免视角未就绪时错过
    hasInitFly.current = true
    canFly.current = true
    bigFly(2000)
  }, [bigFly, lat, lng, mapViewLocked, viewer])

  useEffect(() => {
    if (!mapViewLocked) return

    bigFly()
  }, [bigFly, lng, lat, mapViewLocked])

  const prevLockedRef = useRef(mapViewLocked)

  useEffect(() => {
    if (mapViewLocked && !prevLockedRef.current) {
      canFly.current = true
      bigFly()
    }

    prevLockedRef.current = mapViewLocked
  }, [bigFly, mapViewLocked])

  return null
})

SmartCarViewCombackResolver.displayName = 'SmartCarViewCombackResolver'

export default SmartCarViewCombackResolver
