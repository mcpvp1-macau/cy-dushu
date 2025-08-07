import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { getSpaceDistance } from '@/utils/geo-math'
import { useBoolean } from 'ahooks'
import { v4 } from 'uuid'
import { getHexWithAlpha, hexToARGB } from '@/utils/other/utils'
import useMapDrawStore, { CotType } from '@/store/map/useDraw.store'
import AddFormModal from './components/AddFormModal'
import AddFlightAreaModal from './components/AddFlightAreaModal'
import OverlayCircle from '@/map/CesiumMap/components/service/Overlaies/OverlayCircle'
import useCreateFn from './hooks/useCreateFn'
import AddDeviceOverlayFormModal from './components/AddDeviceOverlayModal'

type PropsType = {
  onSuccess?: () => Promise<void>
}

const DrawCircle: FC<PropsType> = memo(({ onSuccess }) => {
  const drawingColor = useMapDrawStore((s) => s.drawingColor)
  const lineStyle = useMapDrawStore((s) => s.lineStyle)
  const fillOpacity = useMapDrawStore((s) => s.fillOpacity)
  const isFlightArea = useMapDrawStore((s) => s.isFlightArea)
  const isDrawingDeviceArea = useMapDrawStore((s) => s.isDrawingDeviceArea)

  // 设备点位 (用于绘制设备可飞行区域)
  const devicePosition = useMapDrawStore((s) => s.devicePosition)

  /**绘制的点 */
  const [drawingPositions, setDrawingPositions] = useState<[number, number][]>([
    devicePosition ?? [0, 0],
  ])

  const circleCenter = useMemo(() => drawingPositions[0], [drawingPositions])

  const radius = useMemo(() => {
    if (!drawingPositions[0] || !drawingPositions[1]) {
      return 0
    }

    return getSpaceDistance(drawingPositions)
  }, [drawingPositions])

  const [open, { setTrue, setFalse }] = useBoolean(false)

  const { viewer } = useCesium()

  const createFn = useCreateFn()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    const moveHandler = (e) => {
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      const coord = cartesian3ToDegrees(cartesian)
      setDrawingPositions((prePositions) => [
        prePositions[0],
        coord as [number, number],
      ])
    }

    const upHandler = () => {
      setTrue()
    }

    const addSettedCenterActions = () => {
      // 移动
      handler.setInputAction(
        moveHandler,
        Cesium.ScreenSpaceEventType.MOUSE_MOVE,
      )
      // 右键结束
      handler.setInputAction(upHandler, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    // 是否已经指定圆心
    if (circleCenter?.length) {
      // 如果已经指定了圆心
      addSettedCenterActions()
    } else {
      // 左键 选点
      handler.setInputAction((e) => {
        const ray = viewer.camera.getPickRay(e.position)
        if (!ray) return
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!cartesian) return
        // 地形上的点
        const position = cartesian3ToDegrees(cartesian).slice(0, 2) as [
          number,
          number,
        ]
        setDrawingPositions([position, position])

        addSettedCenterActions()
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }

    return () => {
      handler.destroy()
    }
  }, [viewer, circleCenter])

  const handleConfirm = async (data: any) => {
    if (radius < 1) return

    const uuid = v4()

    const strokeColorHex = getHexWithAlpha(drawingColor, 1)
    const strokeColorARGB = hexToARGB(strokeColorHex)
    const fillColorHex = getHexWithAlpha(drawingColor, 0.5)
    const fillColorARGB = hexToARGB(fillColorHex)

    const commitData = {
      ...data,
      overlayType: 'CIRCULAR',
      // 圆的点位固定为四个
      overlayPositions: JSON.stringify([
        [circleCenter[0], circleCenter[1], 0, radius],
      ]),
      overlayBindType: 'NORMAL',
      overlayUuid: uuid,
      overlayStyleConfig: JSON.stringify({
        contact: {
          '-callsign': data.overlayName, //图形名称
        },
        shape: {
          //形状信息
          ellipse: {
            //椭圆、圆形
            '-major': `${radius}`, //椭圆形的最长距离
            '-minor': `${radius}`, //椭圆形的最短距离
            '-angle': '360', //角度
          },
          link: {
            //圆形样式信息
            '-type': 'b-xKmlStyle', //固定
            '-uid': `${uuid}.Style`, //圆形uuid.Style
            '-relation': 'p-c', //固定
            Style: {
              LineStyle: {
                //线条样式
                color: `${strokeColorHex.replace('#', '')}`,
                width: '2.0',
              },
              PolyStyle: {
                //图形样式
                color: `${fillColorHex.replace('#', '')}`,
              },
            },
          },
        },
        strokeColor: {
          //描边颜色
          '-value': `${strokeColorARGB}`,
        },
        fillColor: {
          //填充颜色（argb）
          '-value': `${fillColorARGB}`,
        },
        fillOpacity: {
          '-value': `${fillOpacity}`,
        },
        strokeWeight: {
          //描边宽度
          '-value': '2.0',
        },
        strokeStyle: {
          '-value': `${lineStyle}`,
        },
        remarks: '',
      }),
      overlayExtType: data.overlayExtType,
      cotType: CotType.SHAPE_CIRCLE,
    }

    await createFn(commitData)
    await onSuccess?.()
  }

  return (
    <>
      {isFlightArea ? (
        <AddFlightAreaModal
          open={open}
          onClose={() => {
            setFalse()
            setDrawingPositions([devicePosition ?? [0, 0]])
          }}
          onConfirm={handleConfirm}
        />
      ) : isDrawingDeviceArea ? (
        <AddDeviceOverlayFormModal
          open={open}
          onClose={() => {
            setFalse()
            setDrawingPositions([devicePosition ?? [0, 0]])
          }}
          onConfirm={handleConfirm}
        />
      ) : (
        <AddFormModal
          open={open}
          onClose={() => {
            setFalse()
            setDrawingPositions([devicePosition ?? [0, 0]])
          }}
          onConfirm={handleConfirm}
        />
      )}

      {viewer && (
        <OverlayCircle
          data={''}
          viewer={viewer}
          center={circleCenter?.length ? [...circleCenter] : [0, 0]}
          radius={radius}
          asynchronous={false}
          fill={drawingColor}
          fillOpacity={fillOpacity}
          stroke={drawingColor}
          strokeStyle={lineStyle}
          strokeWeight={2}
        />
      )}
    </>
  )
})

DrawCircle.displayName = 'DrawCircle'

export default DrawCircle
