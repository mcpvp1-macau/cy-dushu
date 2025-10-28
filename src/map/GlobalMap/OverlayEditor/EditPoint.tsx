import useMapDrawStore from '@/store/map/useDraw.store'
import { shouldJson } from '@/utils/json'
import * as Cesium from 'cesium'
import { LabelCollection, PointPrimitiveCollection } from 'resium'
import OverlayPoint from '@/map/CesiumMap/components/service/Overlaies/Point'
import { cartesian3ToDegrees } from '@/utils/geo-math'
import { useThrottleFn } from 'ahooks'
import { hexToARGB } from '@/utils/color'

interface Props {
  overlay: API_LAYER_OVERLAY.domain.Overlay
  viewer: Cesium.Viewer
}

const EditPoint: React.FC<Props> = (props) => {
  const { overlay, viewer } = props

  const drawingColor = useMapDrawStore((s) => s.drawingColor)
  const updatePositions = useMapDrawStore((s) => s.updatePositions)

  const overlayPositions = shouldJson(overlay.overlayPositions)!

  const [drawingPosition, setDrawingPosition] = useState<
    [number, number, number?]
  >(overlayPositions[0])
  const [newOverlay, setNewOverlay] = useState({ ...overlay })
  useEffect(() => {
    const colorRGBA = hexToARGB(drawingColor)
    setNewOverlay({
      ...newOverlay,
      overlayPositions: JSON.stringify([drawingPosition]),
      overlayStyleConfig: JSON.stringify({
        ...shouldJson(overlay.overlayStyleConfig),
        color: {
          '-argb': colorRGBA,
          hex: drawingColor,
        },
      }),
    })
    updatePositions([drawingPosition])
  }, [drawingPosition, drawingColor])

  // 初始化
  useEffect(() => {
    const overlayPositions = shouldJson(overlay.overlayPositions)!
    setDrawingPosition(overlayPositions[0])
  }, [overlay])

  const handlerRef = useRef(
    new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas),
  )

  // drillPick消耗性能太多，使用节流
  const { run: onMouseMove } = useThrottleFn(
    (e: any) => {
      const pickResults = viewer.scene.drillPick(e.endPosition)

      let is3dPick = false
      pickResults.forEach((item) => {
        if (item.primitive instanceof Cesium.Cesium3DTileset) {
          is3dPick = true
        }
      })
      console.log('is3dPick', is3dPick)
      requestAnimationFrame(() => {
        let position: Cesium.Cartesian3 | undefined
        if (is3dPick) {
          position = viewer.scene.pickPosition(e.endPosition)
        } else {
          const ray = viewer.camera.getPickRay(e.endPosition)
          position = ray
            ? viewer.scene.globe.pick(ray, viewer.scene)
            : undefined
        }
        if (!position) {
          return
        }
        const geo = cartesian3ToDegrees(position)
        setDrawingPosition(geo as [number, number, number])
      })
    },
    {
      wait: 60,
    },
  )

  const onLeftUp = useMemoizedFn((e: any) => {
    handlerRef.current.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    handlerRef.current.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)
    viewer.scene.screenSpaceCameraController.enableRotate = true
    viewer.scene.screenSpaceCameraController.enableZoom = true
    viewer.scene.screenSpaceCameraController.enableTranslate = true
  })

  const onLeftDown = useMemoizedFn((e: any) => {
    const pickResult = viewer.scene.pick(e.position)
    if (!pickResult?.primitive?.id) {
      return
    }
    const id = pickResult.primitive.id?.split('overlay--')?.[1]

    if (Number(id) !== overlay.overlayId) {
      return
    }

    // 禁止地球旋转和缩放，地球的旋转会对鼠标移动监听有影响，所以需要禁止
    viewer.scene.screenSpaceCameraController.enableRotate = false
    viewer.scene.screenSpaceCameraController.enableZoom = false
    viewer.scene.screenSpaceCameraController.enableTranslate = false

    handlerRef.current.setInputAction(
      onMouseMove,
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    )
    handlerRef.current.setInputAction(
      onLeftUp,
      Cesium.ScreenSpaceEventType.LEFT_UP,
    )
  })

  useEffect(() => {
    handlerRef.current.setInputAction(
      onLeftDown,
      Cesium.ScreenSpaceEventType.LEFT_DOWN,
    )

    return () => {
      handlerRef.current.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOWN,
      )
      handlerRef.current.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE,
      )
      handlerRef.current.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)
      handlerRef.current.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP)
    }
  }, [])

  return (
    <PointPrimitiveCollection>
      <LabelCollection>
        <OverlayPoint key={overlay.overlayId} data={newOverlay} />
      </LabelCollection>
    </PointPrimitiveCollection>
  )
}

export default memo(EditPoint)
