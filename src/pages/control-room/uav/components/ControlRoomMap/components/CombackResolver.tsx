import * as Cesium from 'cesium'
import { useCesium } from 'resium'
import { useDebounceFn } from 'ahooks'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { attempt, isNil } from 'lodash'

type PropsType = unknown

/** 视角回调 (无人机视角回中) */
const UavViewCombackResolver: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  const canFly = useRef(true)
  const ref = useRef(0)

  const lng = useUavControlRoomStore((s) => s.state.longitude)
  const lat = useUavControlRoomStore((s) => s.state.latitude)
  const mapViewLocked = useUavControlRoomStore((s) => s.lockUavMapView)

  const bigFly = useMemoizedFn(() => {
    if (
      !viewer?.scene ||
      !mapViewLocked ||
      !canFly.current ||
      isNil(lng) ||
      isNil(lat)
    ) {
      return
    }
    viewer.scene.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        lng,
        lat,
        ref.current === 0 ? 1500 : viewer.camera.positionCartographic.height,
      ),
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

UavViewCombackResolver.displayName = 'UavViewCombackResolver'

export default UavViewCombackResolver
