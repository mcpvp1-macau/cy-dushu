import useMapDrawStore, { CotType, DrawType } from '@/store/map/useDraw.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useBoolean } from 'ahooks'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import ReconstructionSettingModal from './SettingModal'
import { getHexWithAlpha, hexToARGB } from '@/utils/other/utils'
import ReconstructionAreaPrimitive from './ReconstructionAreaPrimitive'
import { useAppMsg } from '@/hooks/useAppMsg'

type PropsType = {
  setState: (
    state: 'drawing' | 'setting' | 'error_max' | 'reconstructing',
  ) => void
}

const DrawArea: FC<PropsType> = memo(({ setState }) => {
  const { viewer } = useCesium()
  const msgApi = useAppMsg()

  /** 支点 */
  const paths = useRef<Cesium.Cartesian3[]>([])
  const endPoint = useRef<Cesium.Cartesian3 | null>(null)

  const [open, { setTrue, setFalse }] = useBoolean(false)

  const drawing = useMapDrawStore((s) => s.drawing)
  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)
  const updateEnableReconstruction = useUavControlRoomStore(
    (s) => s.updateEnableReconstruction,
  )
  const drawingColor = useMapDrawStore((s) => s.drawingColor)
  const areaPrimitiveRef = useRef<ReconstructionAreaPrimitive | null>(null)

  useEffect(() => {
    if (!viewer) {
      return
    }
    if (drawing !== DrawType.None) {
      msgApi.error('请先取消绘制或测量')
      updateEnableReconstruction(false)
      return
    }
    updateDrawing(DrawType.ReconstructionArea)
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    areaPrimitiveRef.current = new ReconstructionAreaPrimitive(drawingColor)
    viewer?.scene.primitives.add(areaPrimitiveRef.current)

    // 左键 选点
    handler.setInputAction((e) => {
      const ray = viewer.camera.getPickRay(e.position)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      paths.current.push(cartesian)
      if (endPoint.current && areaPrimitiveRef.current) {
        areaPrimitiveRef.current.positions = [
          ...paths.current,
          endPoint.current,
        ]
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 移动
    handler.setInputAction((e) => {
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      endPoint.current = cartesian
      if (endPoint.current && areaPrimitiveRef.current) {
        areaPrimitiveRef.current.positions = [
          ...paths.current,
          endPoint.current,
        ]
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 右键结束
    handler.setInputAction(() => {
      if (paths.current.length >= 2) {
        setTrue()
        setState('setting')
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    return () => {
      updateDrawing(DrawType.None)
      viewer?.scene.primitives.remove(areaPrimitiveRef.current)
      handler.destroy()
    }
  }, [viewer])

  const handleConfirm = async (data: any) => {
    if (paths.current.length < 2) {
      return
    }

    const strokeColorHex = getHexWithAlpha(drawingColor, 1)
    const strokeColorARGB = hexToARGB(strokeColorHex)
    const fillColorHex = getHexWithAlpha(drawingColor, 0.5)
    const fillColorARGB = hexToARGB(fillColorHex)

    const commitData = {
      layerId: data.layerId,
      overlayName: data.overlayName,
      overlayType: 'POLYGON',
      overlayPositions: JSON.stringify([...paths.current, endPoint.current]),
      overlayBindType: 'NORMAL',
      overlayStyleConfig: JSON.stringify({
        contact: {
          '-callsign': data.overlayName, //多边形名称
        },
        strokeColor: {
          '-value': `${strokeColorARGB}`, //描边颜色（argb）
        },
        strokeWeight: {
          '-value': '2.0', //描边宽度
        },
        strokeStyle: {
          '-value': 'solid', //描边样式(solid:实线;dashed:虚线;dotted:斑点线,outlined:轮廓线)
        },
        fillColor: {
          '-value': `${fillColorARGB}`, //填充色（argb）
        },
        labels_on: {
          '-value': 'false', //是否显示标签
        },
        height: {
          '-value': '2.0', //高度
        },
        color: {
          '-value': '-1', //颜色,先默认-1
        },
        remarks: '',
      }),
      cotType: CotType.SHAPE_POLYGON,
    }
    setFalse()
    setState('reconstructing')
  }

  return (
    <ReconstructionSettingModal
      open={open}
      onClose={() => {
        setFalse()
        paths.current = []
        endPoint.current = null
        setState('drawing')
      }}
      onConfirm={handleConfirm}
    />
  )
})

DrawArea.displayName = 'DrawArea'

export default DrawArea
