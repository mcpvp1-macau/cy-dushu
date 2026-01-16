import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useThrottleFn } from 'ahooks'
import mitt from 'mitt'
import IconButton from '@/components/ui/button/IconButton'
import { CopyOutlined } from '@ant-design/icons'
import { useAppMsg } from '@/hooks/useAppMsg'
import LiqunTippy from '@/components/ui/LiqunTippy'

/** 位置事件发射器 */
export const positionEmitter = mitt<{
  click: { lon: number; lat: number; alt: number }
}>()

/** 地图底部工具栏 */
const BottomBar: FC<unknown> = memo(() => {
  const { viewer } = useCesium()
  const msgApi = useAppMsg()
  const { t } = useTranslation()

  const [position, setPosition] = useState<{
    lon: number
    lat: number
    alt?: number
  } | null>(null)

  const [openCopy, { toggle: toggleOpenCopy }] = useBoolean(false)

  /** 鼠标移动时更新坐标展示 */
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

    // 仅在开启复制时监听点击复制，避免无效订阅
    /** 处理点击复制坐标 */
    const fn = async (pos: { lon: number; lat: number; alt: number }) => {
      await navigator.clipboard.writeText(
        `${pos.lon.toFixed(6)}, ${pos.lat.toFixed(6)}, ${pos.alt.toFixed(1)}`,
      )
      msgApi.success(
        t('map.bottomBar.copySuccess', { defaultValue: '坐标已复制到剪切板' }),
      )
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
          tippyProps={{
            content: openCopy
              ? t('map.bottomBar.copyCoordinates', {
                  defaultValue: '坐标复制',
                })
              : t('map.bottomBar.copyCoordinatesHint', {
                  defaultValue: '坐标复制 (点击地图后坐标会复制到剪切板)',
                }),
          }}
        >
          <CopyOutlined />
        </IconButton>
        <LiqunTippy
          content={t('map.bottomBar.mousePosition', {
            defaultValue: '当前鼠标位置坐标 (经度, 纬度, 高程)',
          })}
          placement="top"
        >
          <p className="text-right whitespace-nowrap flex items-center gap-1">
            <span>
              {position?.lon?.toFixed(6) || '-'},{' '}
              {position?.lat?.toFixed(6) || '-'},{' '}
              {position?.alt?.toFixed(1) || '-'} m
            </span>
          </p>
        </LiqunTippy>
      </div>
    </div>
  )
})

BottomBar.displayName = 'BottomBar'

export default BottomBar
