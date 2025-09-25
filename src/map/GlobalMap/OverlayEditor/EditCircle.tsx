import OverlayCircle from '@/map/CesiumMap/components/service/Overlaies/OverlayCircle'
import useMapDrawStore from '@/store/map/useDraw.store'
import {
  getPointFromWindowCoords,
  getPositionsByLlhr,
  getRadiusByPositions,
} from '@/utils/geoUtils'
import { shouldJson } from '@/utils/json'
import { DragPointCollection } from '@/utils/customPrimitive/OverlayPrimitive'
import * as Cesium from 'cesium'
import { round } from 'lodash'

interface Props {
  overlay: API_LAYER_OVERLAY.domain.Overlay
  viewer: Cesium.Viewer
}

const EditCircle: React.FC<Props> = (props) => {
  const { overlay, viewer } = props

  const drawingColor = useMapDrawStore((s) => s.drawingColor)
  const fillOpacity = useMapDrawStore((s) => s.fillOpacity)
  const lineStyle = useMapDrawStore((s) => s.lineStyle)
  const updatePositions = useMapDrawStore((s) => s.updatePositions)

  const overlayPositions = shouldJson(overlay.overlayPositions)!
  // 记录的圆心点与操作点的位置，用于编辑时的拖拽等操作
  const [drawingPositions, setDrawingPositions] = useState<[number, number][]>([
    overlayPositions[0],
    getPositionsByLlhr(overlayPositions[0]),
  ])

  // 初始化
  useEffect(() => {
    const overlayPositions = shouldJson(overlay.overlayPositions)!
    setDrawingPositions([
      overlayPositions[0],
      getPositionsByLlhr(overlayPositions[0]),
    ])
  }, [overlay])

  const handlerRef = useRef(
    new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas),
  )
  const dragPointRef = useRef(new DragPointCollection([], viewer))
  const moveIndex = useRef(-1) // 本次移动的点对应的索引
  const preLnglat = useRef<number[] | null>(null)

  // 整体移动
  const onMouseMoveEntire = useMemoizedFn((e: any) => {
    const endLnglat = getPointFromWindowCoords(viewer, e.endPosition)
    if (!endLnglat || !preLnglat.current) {
      return
    }

    const subLongitude = round(endLnglat[0] - preLnglat.current[0], 6)
    const subLatitude = round(endLnglat[1] - preLnglat.current[1], 6)

    preLnglat.current = endLnglat

    setDrawingPositions((prePositions) => {
      return prePositions.map((prePosition) => [
        prePosition[0] + subLongitude,
        prePosition[1] + subLatitude,
      ])
    })
  })
  // 移动点
  const onMouseMovePoint = useMemoizedFn((e: any) => {
    const endLnglat = getPointFromWindowCoords(viewer, e.endPosition)
    if (!endLnglat || !preLnglat.current) {
      return
    }

    const subLongitude = round(endLnglat[0] - preLnglat.current[0], 6)
    const subLatitude = round(endLnglat[1] - preLnglat.current[1], 6)

    setDrawingPositions((prePositions) => {
      const preHandlePoint = prePositions[1]

      const newHandlePoint = [
        preHandlePoint[0] + subLongitude,
        preHandlePoint[1] + subLatitude,
      ] as [number, number]

      return [prePositions[0], newHandlePoint]
    })

    preLnglat.current = endLnglat
  })

  const onLeftUp = useMemoizedFn((e: any) => {
    handlerRef.current.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    handlerRef.current.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)
    viewer.scene.screenSpaceCameraController.enableRotate = true
    viewer.scene.screenSpaceCameraController.enableZoom = true
    viewer.scene.screenSpaceCameraController.enableTranslate = true
  })

  const onLeftDown = useMemoizedFn((e: any) => {
    const pickResult = viewer.scene.pick(e.position)
    if (!pickResult?.primitive) {
      return
    }

    if (pickResult?.primitive?.props == overlay.overlayId) {
      moveIndex.current = -1
      // 禁止地球旋转和缩放，地球的旋转会对鼠标移动监听有影响，所以需要禁止
      viewer.scene.screenSpaceCameraController.enableRotate = false
      viewer.scene.screenSpaceCameraController.enableZoom = false
      viewer.scene.screenSpaceCameraController.enableTranslate = false
      preLnglat.current = getPointFromWindowCoords(viewer, e.position)!

      handlerRef.current.setInputAction(
        onMouseMoveEntire,
        Cesium.ScreenSpaceEventType.MOUSE_MOVE,
      )
      handlerRef.current.setInputAction(
        onLeftUp,
        Cesium.ScreenSpaceEventType.LEFT_UP,
      )
    } else if (dragPointRef.current.indexOf(pickResult.primitive) !== -1) {
      moveIndex.current = dragPointRef.current.indexOf(pickResult.primitive)
      // 禁止地球旋转和缩放，地球的旋转会对鼠标移动监听有影响，所以需要禁止
      viewer.scene.screenSpaceCameraController.enableRotate = false
      viewer.scene.screenSpaceCameraController.enableZoom = false
      viewer.scene.screenSpaceCameraController.enableTranslate = false
      preLnglat.current = getPointFromWindowCoords(viewer, e.position)!

      handlerRef.current.setInputAction(
        onMouseMovePoint,
        Cesium.ScreenSpaceEventType.MOUSE_MOVE,
      )
      handlerRef.current.setInputAction(
        onLeftUp,
        Cesium.ScreenSpaceEventType.LEFT_UP,
      )
    }
  })

  useEffect(() => {
    handlerRef.current.setInputAction(
      onLeftDown,
      Cesium.ScreenSpaceEventType.LEFT_DOWN,
    )
    viewer.scene.primitives.add(dragPointRef.current)

    return () => {
      handlerRef.current.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOWN,
      )
      handlerRef.current.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE,
      )
      handlerRef.current.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)
      handlerRef.current.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)
      const preVal = viewer.scene.primitives.destroyPrimitives
      viewer.scene.primitives.destroyPrimitives = false
      viewer.scene.primitives.remove(dragPointRef.current)
      viewer.scene.primitives.destroyPrimitives = preVal
    }
  }, [])

  useEffect(() => {
    if (drawingPositions) {
      dragPointRef.current.positions = [drawingPositions[1]]
    }
  }, [drawingPositions])

  // 生成绘制圆需要的数据
  const lnglatHRadius = useMemo(() => {
    const center = drawingPositions[0]
    const otherPoint = drawingPositions[1]
    const circleOverlayPositions = [
      center[0],
      center[1],
      0,
      getRadiusByPositions(center, otherPoint),
    ]

    return circleOverlayPositions.map((item) => round(item, 6))
  }, [drawingPositions])

  useEffect(() => {
    updatePositions([lnglatHRadius] as any)
  }, [lnglatHRadius])

  return (
    <>
      <OverlayCircle
        data={`${overlay.overlayId}`}
        primitives={viewer.scene.primitives}
        center={[lnglatHRadius[0], lnglatHRadius[1]]}
        radius={lnglatHRadius[3]}
        asynchronous={false}
        fill={drawingColor}
        fillOpacity={fillOpacity}
        stroke={drawingColor}
        strokeStyle={lineStyle}
        strokeWeight={2}
      ></OverlayCircle>
    </>
  )
}

export default memo(EditCircle)
