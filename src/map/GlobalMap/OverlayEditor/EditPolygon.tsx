import OverlayPolygon from '@/map/CesiumMap/components/service/Overlaies/OverlayPolygon'
import useMapDrawStore from '@/store/map/useDraw.store'
import { shouldJson } from '@/utils/json'
import { DragPointCollection } from '@/utils/customPrimitive/OverlayPrimitive'
import * as Cesium from 'cesium'
import { getPointFromWindowCoords } from '@/utils/geoUtils'
import { round } from 'lodash'

interface Props {
  overlay: API_LAYER_OVERLAY.domain.Overlay
  viewer: Cesium.Viewer
  isRect: boolean
}

const EditPolygon: React.FC<Props> = (props) => {
  const { overlay, viewer, isRect } = props
  const drawingColor = useMapDrawStore((s) => s.drawingColor)
  const fillOpacity = useMapDrawStore((s) => s.fillOpacity)
  const lineStyle = useMapDrawStore((s) => s.lineStyle)
  const updatePositions = useMapDrawStore((s) => s.updatePositions)

  // 编辑后的点集合
  const [drawingPositions, setDrawingPositions] = useState<[number, number][]>(
    shouldJson(overlay.overlayPositions)!,
  )

  useEffect(() => {
    setDrawingPositions(shouldJson(overlay.overlayPositions)!)
  }, [overlay])

  const handlerRef = useRef(
    new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas),
  )
  const dragPointRef = useRef(new DragPointCollection([]))
  const moveIndex = useRef(-1) // 本次移动的点对应的索引
  const preLnglat = useRef<number[] | null>(null)
  // 整体移动
  const onMouseMoveEntire = useMemoizedFn((e: any) => {
    const endLnglat = getPointFromWindowCoords(viewer, e.endPosition)

    if (!endLnglat || !preLnglat.current) {
      return
    }

    const subLongitude = endLnglat[0] - preLnglat.current[0]
    const subLatitude = endLnglat[1] - preLnglat.current[1]

    preLnglat.current = endLnglat
    setDrawingPositions((prePositions) => {
      return prePositions.map((prePosition) => [
        round(prePosition[0] + subLongitude, 6),
        round(prePosition[1] + subLatitude, 6),
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

    preLnglat.current = endLnglat
    if (isRect) {
      setDrawingPositions((prePositions) => {
        let newPositions: [number, number][]
        const lnglat: [number, number] = [
          prePositions[moveIndex.current][0] + subLongitude,
          prePositions[moveIndex.current][1] + subLatitude,
        ]
        if (moveIndex.current === 0) {
          const point = prePositions[2]
          newPositions = [
            lnglat,
            [lnglat[0], point[1]],
            point,
            [point[0], lnglat[1]],
          ]
        } else if (moveIndex.current === 1) {
          const point = prePositions[3]
          newPositions = [
            [lnglat[0], point[1]],
            lnglat,
            [point[0], lnglat[1]],
            point,
          ]
        } else if (moveIndex.current === 2) {
          const point = prePositions[0]
          newPositions = [
            point,
            [lnglat[0], point[1]],
            lnglat,
            [point[0], lnglat[1]],
          ]
        } else {
          const point = prePositions[1]
          newPositions = [
            [lnglat[0], point[1]],
            point,
            [point[0], lnglat[1]],
            lnglat,
          ]
        }

        return newPositions.map((coord) =>
          coord.map((item) => round(item, 6)),
        ) as [number, number][]
      })
    } else {
      setDrawingPositions((prePositions) => {
        return prePositions.map((prePosition, index) => {
          let newPosition
          if (index === moveIndex.current) {
            newPosition = [
              prePosition[0] + subLongitude,
              prePosition[1] + subLatitude,
            ]
          } else {
            newPosition = prePosition
          }

          return newPosition.map((item) => round(item, 6))
        })
      })
    }
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

    if (
      pickResult?.primitive?.props?.slice('overlay--'.length) ==
      overlay.overlayId
    ) {
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
      const preVal = viewer.scene.primitives.destroyPrimitives
      viewer.scene.primitives.destroyPrimitives = false
      viewer.scene.primitives.remove(dragPointRef.current)
      viewer.scene.primitives.destroyPrimitives = preVal
    }
  }, [])

  useEffect(() => {
    dragPointRef.current.positions = drawingPositions
    updatePositions(drawingPositions)
  }, [drawingPositions])

  return (
    <>
      <OverlayPolygon
        data={`overlay--${overlay.overlayId}`}
        viewer={viewer}
        path={drawingPositions}
        asynchronous={false}
        fill={drawingColor}
        fillOpacity={fillOpacity}
        stroke={drawingColor}
        strokeStyle={lineStyle}
        strokeWeight={2}
      ></OverlayPolygon>
    </>
  )
}

export default memo(EditPolygon)
