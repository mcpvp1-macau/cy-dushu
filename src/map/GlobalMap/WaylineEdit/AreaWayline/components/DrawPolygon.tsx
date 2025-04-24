import { Fragment } from 'react'
import { PointPrimitive, PointPrimitiveCollection, useCesium } from 'resium'
import * as Cesium from 'cesium'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import PositionHTML from '@/components/map/PositionHTML'
import { CheckCircleFilled } from '@ant-design/icons'
import { getSpaceDistance } from '@/utils/geo-math'
import { formatDistance } from '@/utils/format/unit'
import Polygon from './Polygon'

type PropsType = {
  fillColor?: string
  outlineColor?: string
  /** 是否展示距离 */
  showDistance?: boolean
  onDrawEnd?: (polygon: number[][]) => void
}

/** 获取中间点 */
export const getMidPoint = (p1: number[], p2: number[]) => [
  (p1[0] + p2[0]) / 2,
  (p1[1] + p2[1]) / 2,
]

/** 绘制多边形 */
const DrawPolygon: FC<PropsType> = memo(
  ({
    fillColor = '#3b82f666',
    outlineColor = '#3b82f6',
    showDistance,
    onDrawEnd,
  }) => {
    const { viewer } = useCesium()
    const [path, setPath] = useState<number[][]>([])
    const [mousePoint, setMousePoint] = useState<number[] | null>(null)

    // 绘制多边形 鼠标事件 ------------------------------
    useEffect(() => {
      if (!viewer) {
        return
      }

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

      // 左键 选点
      handler.setInputAction((e) => {
        const ray = viewer.camera.getPickRay(e.position)
        if (!ray) return
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!cartesian) return
        // 地形上的点
        const geo = cartesian3ToDegrees(cartesian)
        setPath((prev) => [...prev, [geo[0], geo[1]]])
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      // 移动
      handler.setInputAction((e) => {
        const ray = viewer.camera.getPickRay(e.endPosition)
        if (!ray) return
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!cartesian) return
        // 地形上的点
        const geo = cartesian3ToDegrees(cartesian)
        setMousePoint([geo[0], geo[1]])
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      return () => {
        handler.destroy()
      }
    }, [viewer])

    // 取消绘制
    useEffect(() => {
      if (path.length < 1) {
        return
      }

      // 监听是否为 Esc 键
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setPath([])
        }
      }

      window.addEventListener('keyup', handler)
      return () => {
        window.removeEventListener('keyup', handler)
      }
    }, [path.length >= 1])

    return (
      <>
        <PointPrimitiveCollection>
          {path.slice(0, -1).map((p, i) => (
            <Fragment key={i}>
              <PointPrimitive
                position={Cesium.Cartesian3.fromDegrees(p[0], p[1])}
                color={Cesium.Color.fromCssColorString('#fff')}
              />
              {showDistance && (
                <PositionHTML position={getMidPoint(p, path[i + 1])}>
                  <div className="p-0.5 px-1 bg-ground-1 rounded text-xs bg-opacity-70 whitespace-nowrap">
                    {formatDistance(getSpaceDistance([p, path[i + 1]]))}
                  </div>
                </PositionHTML>
              )}
            </Fragment>
          ))}
        </PointPrimitiveCollection>

        {/* 结束按钮 */}
        {path.length > 0 && (
          <PositionHTML className="z-10" position={path[path.length - 1]}>
            <CheckCircleFilled
              className="text-sm text-white cursor-pointer shadow-sm"
              onClick={() => onDrawEnd?.(path)}
            />
          </PositionHTML>
        )}

        {mousePoint && (
          <Polygon
            useCallback
            polygon={[...path, mousePoint]}
            fillColor={fillColor}
            outlineColor={outlineColor}
          />
        )}

        {/* 鼠标垫前后距离提示 */}
        {showDistance && mousePoint && (
          <>
            {path.length > 0 && (
              <PositionHTML
                className="pointer-events-none"
                position={getMidPoint(mousePoint, path[0])}
              >
                <div className="p-0.5 px-1 bg-ground-1 rounded text-xs bg-opacity-70 whitespace-nowrap">
                  {formatDistance(getSpaceDistance([mousePoint, path[0]]))}
                </div>
              </PositionHTML>
            )}
            {path.length > 1 && (
              <PositionHTML
                className="pointer-events-none"
                position={getMidPoint(mousePoint, path[path.length - 1])}
              >
                <div className="p-0.5 px-1 bg-ground-1 rounded text-xs bg-opacity-70 whitespace-nowrap">
                  {formatDistance(
                    getSpaceDistance([mousePoint, path[path.length - 1]]),
                  )}
                </div>
              </PositionHTML>
            )}
          </>
        )}
      </>
    )
  },
)

DrawPolygon.displayName = 'DrawPolygon'

export default DrawPolygon
