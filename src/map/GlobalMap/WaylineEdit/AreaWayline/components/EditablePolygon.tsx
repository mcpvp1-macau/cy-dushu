import { Fragment, memo, type FC } from 'react'
import { PointPrimitive, PointPrimitiveCollection, useCesium } from 'resium'
import * as Cesium from 'cesium'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import GroundPolygon from '@/map/CesiumMap/components/service/common/GroundPolygon'

type PropsType = {
  isEdit?: boolean
  disable?: boolean
  polygon: number[][]
  onPolygonChange?: (polygon: number[][]) => void
  onClear?: () => void
}

/** 可编辑的多边形 */
const EditablePolygon: FC<PropsType> = memo(
  ({ polygon: propsPolygon, isEdit, onPolygonChange, onClear }) => {
    const [isDrawing, setIsDrawing] = useState(false)

    const [polygon, setPolygon] = useState(propsPolygon)

    const { viewer } = useCesium()

    /** 获取中间点 */
    const getMidPoint = useMemoizedFn((p1: number[], p2: number[]) => [
      (p1[0] + p2[0]) / 2,
      (p1[1] + p2[1]) / 2,
      viewer?.scene?.globe?.getHeight(
        Cesium.Cartographic.fromDegrees(
          (p1[0] + p2[0]) / 2,
          (p1[1] + p2[1]) / 2,
        ),
      ) ?? 0,
    ])

    const handleMouseMove = () => {
      if (viewer?.canvas) {
        viewer.canvas.style.cursor = 'move'
      }
    }

    const handleMouseLeave = () => {
      if (!isDrawing && viewer?.canvas) {
        viewer.canvas.style.cursor = 'auto'
      }
    }

    const handleMouseUp = useMemoizedFn(() => {
      if (!isDrawing) {
        return
      }
      setIsDrawing(false)
      if (viewer?.scene?.screenSpaceCameraController) {
        viewer.scene.screenSpaceCameraController.enableRotate = true
      }
      window.document.body.style.cursor = 'auto'
      onPolygonChange?.(polygon)
    })

    const [index, setIndex] = useState<number>(0)
    const [isMid, setIsMid] = useState<boolean>(false)
    const handleMouseDown = (index: number, isMid: boolean) => {
      setIsDrawing(true)
      setIndex(index)
      setIsMid(isMid)
    }

    useEffect(() => {
      if (!viewer?.canvas || !isDrawing) {
        return
      }
      viewer.scene.screenSpaceCameraController.enableRotate = false

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

      const oldPolygon = polygon

      handler.setInputAction(
        (e: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
          const ray = viewer.camera.getPickRay(e.endPosition)
          if (!ray) return
          const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
          if (!cartesian) return
          const geo = cartesian3ToDegrees(cartesian)
          if (isMid) {
            const newPolygon = [
              ...oldPolygon.slice(0, index + 1),
              [geo[0], geo[1], geo[2]],
              ...oldPolygon.slice(index + 1),
            ]
            setPolygon(newPolygon)
          } else {
            const newPolygon = [...oldPolygon]
            newPolygon[index] = [geo[0], geo[1], geo[2]]
            setPolygon(newPolygon)
          }
        },
        Cesium.ScreenSpaceEventType.MOUSE_MOVE,
      )

      handler.setInputAction(handleMouseUp, Cesium.ScreenSpaceEventType.LEFT_UP)

      return () => {
        handler.destroy()
      }
    }, [viewer, isDrawing])

    useEffect(() => {
      if (!viewer?.canvas) {
        return
      }
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
      handler.setInputAction(handleMouseUp, Cesium.ScreenSpaceEventType.LEFT_UP)
      return () => {
        handler.destroy()
      }
    }, [])

    useEffect(() => {
      window.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
          setIsDrawing(false)
          if (viewer?.scene?.screenSpaceCameraController) {
            viewer.scene.screenSpaceCameraController.enableRotate = true
          }
          window.document.body.style.cursor = 'auto'
        }
      })
    }, [])

    // 取消事件
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClear?.()
        }
      }

      window.addEventListener('keyup', handler)

      return () => {
        window.removeEventListener('keyup', handler)
      }
    })

    return (
      <>
        {isEdit && (
          <PointPrimitiveCollection>
            {polygon.map((point, index) => {
              const next = polygon[(index + 1) % polygon.length]
              const mid = getMidPoint(point, next)
              return (
                <Fragment key={index}>
                  <PointPrimitive
                    position={Cesium.Cartesian3.fromDegrees(
                      point[0],
                      point[1],
                      point[2],
                    )}
                    color={Cesium.Color.WHITE}
                    pixelSize={11}
                    onMouseMove={handleMouseMove}
                    onMouseDown={
                      !isDrawing
                        ? () => handleMouseDown(index, false)
                        : undefined
                    }
                    onMouseLeave={handleMouseLeave}
                  />
                  <PointPrimitive
                    position={Cesium.Cartesian3.fromDegrees(
                      mid[0],
                      mid[1],
                      mid[2],
                    )}
                    color={Cesium.Color.WHITE}
                    pixelSize={9}
                    onMouseMove={handleMouseMove}
                    onMouseDown={
                      !isDrawing
                        ? () => handleMouseDown(index, true)
                        : undefined
                    }
                    onMouseLeave={handleMouseLeave}
                  />
                </Fragment>
              )
            })}
          </PointPrimitiveCollection>
        )}
        <GroundPolygon positions={polygon} />
      </>
    )
  },
)

EditablePolygon.displayName = 'EditablePolygon'

export default EditablePolygon
