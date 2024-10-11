import useMapDrawStore, { CotType } from '@/store/map/useDraw.store'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { useBoolean } from 'ahooks'
import { attempt, flatten } from 'lodash'
import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import AddFormModal from './components/AddFormModal'
import { getHexWithAlpha, hexToARGB } from '@/utils/other/utils'
import { createOverlay } from '@/service/modules/layer_overlay'
import * as turf from '@turf/turf'

type PropsType = {
  onSuccess?: () => void
}

const getFan = (pivot: number[], startPoint: number[], endPoint: number[]) => {
  const pp = turf.point(pivot)
  const sp = turf.point(startPoint)
  const ep = turf.point(endPoint)
  const startBearing = (turf.rhumbBearing(pp, sp) + 360) % 360
  let endBearing = (turf.rhumbBearing(pp, ep) + 360) % 360
  if (endBearing < startBearing) {
    endBearing += 360
  }
  const distance = turf.distance(pp, ep)
  const res = [pivot]
  for (let current = startBearing; current < endBearing; current += 8) {
    let bearing = current
    if (bearing >= 360) {
      bearing -= 360
    }
    if (bearing > 180) {
      bearing -= 360
    }
    const newPoint = turf.destination(pp, distance, bearing)
    res.push(newPoint.geometry.coordinates)
  }
  res.push(turf.destination(pp, distance, endBearing).geometry.coordinates)
  res.push(pivot)
  return res
}

const DrawFan: FC<PropsType> = memo(({ onSuccess }) => {
  const { viewer } = useCesium()
  /** 支点 */
  const pivot = useRef<number[] | null>(null)
  const startPoint = useRef<number[] | null>(null)
  const endPoint = useRef<number[] | null>(null)

  const [open, { setTrue, setFalse }] = useBoolean(false)

  const drawingColor = useMapDrawStore((s) => s.drawingColor)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const position = new Cesium.CallbackProperty(() => {
      if (!pivot.current || !startPoint.current || !endPoint.current) {
        return {
          positions: Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 0]),
        }
      }
      const result = Cesium.Cartesian3.fromDegreesArray(
        flatten(getFan(pivot.current, startPoint.current, endPoint.current)),
      )
      return {
        positions: result,
      }
    }, false)

    const e = viewer.entities.add({
      polygon: {
        hierarchy: position,
        material: Cesium.Color.fromCssColorString(drawingColor).withAlpha(0.5),
        height: 0,
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString(drawingColor),
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(e)
      })
    }
  }, [viewer, drawingColor])

  useEffect(() => {
    if (!viewer) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    // 左键 选点
    handler.setInputAction((e) => {
      if (pivot.current && startPoint.current) {
        return
      }
      const ray = viewer.camera.getPickRay(e.position)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      if (!pivot.current) {
        pivot.current = cartesian3ToDegrees(cartesian).slice(0, 2)
      } else {
        startPoint.current = cartesian3ToDegrees(cartesian).slice(0, 2)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 移动
    handler.setInputAction((e) => {
      if (!pivot.current || !startPoint.current) {
        return
      }
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      endPoint.current = cartesian3ToDegrees(cartesian).slice(0, 2)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 右键结束
    handler.setInputAction(() => {
      if (pivot.current && endPoint.current) {
        setTrue()
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [viewer])

  const handleConfirm = async (data: any) => {
    if (!pivot.current || !endPoint.current || !startPoint.current) {
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
      overlayPositions: JSON.stringify(
        getFan(pivot.current, startPoint.current, endPoint.current),
      ),
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
    await createOverlay(commitData)
    onSuccess?.()
    setFalse()
  }

  return (
    <AddFormModal
      open={open}
      onClose={() => {
        setFalse()
        pivot.current = null
        endPoint.current = null
        startPoint.current = null
      }}
      onConfirm={handleConfirm}
    />
  )
})

DrawFan.displayName = 'DrawFan'

export default DrawFan
