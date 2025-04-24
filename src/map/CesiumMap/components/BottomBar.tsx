import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useThrottleFn } from 'ahooks'

const BottomBar: FC<unknown> = memo(() => {
  const { viewer } = useCesium()

  const [position, setPosition] = useState<{
    lon: number
    lat: number
    alt?: number
  } | null>(null)

  const { run: updateMousePosition } = useThrottleFn(
    (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      if (!viewer) {
        return
      }

      const ray = viewer.camera.getPickRay(movement.endPosition)
      if (!ray) {
        return
      }
      // Get the cartesian position from the mouse position
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)

      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const lon = Cesium.Math.toDegrees(cartographic.longitude)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        const alt = cartographic.height
        setPosition({ lon, lat, alt })
      } else {
        setPosition(null)
      }
    },
    {
      wait: 120,
    },
  )

  useEffect(() => {
    if (!viewer) return

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction(
      updateMousePosition,
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    )

    return () => {
      handler.destroy()
    }
  }, [viewer])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-5 bg-[#16202be6] backdrop-blur-sm z-10">
      <div className="flex h-full items-center justify-end text-fore text-xs px-3">
        <p className="text-right whitespace-nowrap">
          {position?.lon?.toFixed(6) || '-'}, {position?.lat?.toFixed(6) || '-'}
          , {position?.alt?.toFixed(1) || '-'} m
        </p>
      </div>
    </div>
  )
})

BottomBar.displayName = 'BottomBar'

export default BottomBar
