import { memo, type FC } from 'react'
import * as Cesium from 'cesium'
import { useCesium } from 'resium'
import { useDebounceFn } from 'ahooks'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { isNil } from 'lodash'

type PropsType = unknown

/** 视角回调 (无人机视角回中) */
const UavViewCombackResolver: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  const canFly = useRef(true)
  const ref = useRef(0)

  const lng = useUavControlRoomStore((s) => s.state.longitude)
  const lat = useUavControlRoomStore((s) => s.state.latitude)

  const bigFly = () => {
    if (!viewer?.scene || !canFly.current || isNil(lng) || isNil(lat)) {
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
  }

  const { run: comeBack } = useDebounceFn(
    () => {
      canFly.current = true
      bigFly()
    },
    {
      leading: false,
      wait: 15_000,
    },
  )

  useEffect(() => {
    if (!viewer?.scene) return

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
      isDrag = false
    }, Cesium.ScreenSpaceEventType.LEFT_UP)

    return () => {
      handler.destroy()
    }
  }, [])

  useEffect(() => {
    bigFly()
  }, [lng, lat])

  return null
})

UavViewCombackResolver.displayName = 'UavViewCombackResolver'

export default UavViewCombackResolver
