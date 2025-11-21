import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useThrottleFn } from 'ahooks'
import mitt from 'mitt'
import IconButton from '@/components/ui/button/IconButton'
import { CopyOutlined } from '@ant-design/icons'
import { useAppMsg } from '@/hooks/useAppMsg'

/** 位置事件发射器 */
export const positionEmitter = mitt<{
  click: { lon: number; lat: number; alt: number }
}>()

const BottomBar: FC<unknown> = memo(() => {
  const { viewer } = useCesium()
  const msgApi = useAppMsg()

  const [position, setPosition] = useState<{
    lon: number
    lat: number
    alt?: number
  } | null>(null)

  const [openCopy, { toggle: toggleOpenCopy }] = useBoolean(false)

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

    handler.setInputAction((movement) => {
      if (!viewer) {
        return
      }

      const ray = viewer.camera.getPickRay(movement.position)
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
        positionEmitter.emit('click', { lon, lat, alt })
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [viewer])

  useEffect(() => {
    if (!openCopy) {
      return
    }

    const fn = async (pos: { lon: number; lat: number; alt: number }) => {
      await navigator.clipboard.writeText(
        `${pos.lon.toFixed(6)}, ${pos.lat.toFixed(6)}, ${pos.alt.toFixed(1)}`,
      )
      msgApi.success('坐标已复制到剪切板')
    }

    positionEmitter.on('click', fn)

    return () => {
      positionEmitter.off('click', fn)
    }
  }, [openCopy])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-5 bg-ground-1/90 backdrop-blur-sm z-10">
      <div className="flex h-full items-center justify-end text-fore text-xs px-3 gap-1">
        <IconButton
          active={openCopy}
          onClick={toggleOpenCopy}
          toolTipProps={{
            title: openCopy
              ? '坐标复制'
              : '坐标复制 (点击地图后坐标会复制到剪切板)',
          }}
        >
          <CopyOutlined />
        </IconButton>
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
