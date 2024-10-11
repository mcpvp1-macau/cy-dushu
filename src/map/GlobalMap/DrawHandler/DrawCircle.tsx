import { cartesian3ToDegrees } from '@/utils/geoUtils'
import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { getSpaceDistance } from '@/utils/geo-math'
import { attempt } from 'lodash'
import { useBoolean } from 'ahooks'
import { v4 } from 'uuid'
import { getHexWithAlpha, hexToARGB } from '@/utils/other/utils'
import useMapDrawStore, { CotType } from '@/store/map/useDraw.store'
import { createOverlay } from '@/service/modules/layer_overlay'
import AddFormModal from './components/AddFormModal'

type PropsType = {
  onSuccess?: () => void
}

const DrawCircle: FC<PropsType> = memo(({ onSuccess }) => {
  const drawingColor = useMapDrawStore((s) => s.drawingColor)

  /** 圆心 */
  const circleCenter = useRef<number[] | null>(null)
  const radius = useRef<number>(1e-5)

  const [open, { setTrue, setFalse }] = useBoolean(false)

  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const axis = new Cesium.CallbackProperty(
      () => radius.current ?? 1e-5,
      false,
    )
    const position = new Cesium.CallbackProperty(() => {
      return Cesium.Cartesian3.fromDegrees(
        circleCenter.current?.[0] ?? 0,
        circleCenter.current?.[1] ?? 0,
      )
    }, false)

    const e = viewer.entities.add({
      position: position, // 初始圆心
      ellipse: {
        semiMajorAxis: axis, // 半径，单位为米
        semiMinorAxis: axis, // 半径，设置为相同值使其为圆
        material: Cesium.Color.fromCssColorString(drawingColor).withAlpha(0.4), // 半透明的颜色
      },
    })

    const outlineE = viewer.entities.add({
      position: position, // 初始圆心
      ellipse: {
        semiMajorAxis: axis, // 半径，单位为米
        semiMinorAxis: axis, // 半径，设置为相同值使其为圆
        material: Cesium.Color.TRANSPARENT, // 半透明的颜色
        outline: true,
        fill: false,
        outlineColor: Cesium.Color.fromCssColorString(drawingColor),
        outlineWidth: 3,
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(e)
        viewer.entities.remove(outlineE)
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
      if (circleCenter.current) {
        return
      }
      const ray = viewer.camera.getPickRay(e.position)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      circleCenter.current = cartesian3ToDegrees(cartesian)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 移动
    handler.setInputAction((e) => {
      if (!circleCenter.current) {
        return
      }
      const ray = viewer.camera.getPickRay(e.endPosition)
      if (!ray) return
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      if (!cartesian) return
      // 地形上的点
      const geo = cartesian3ToDegrees(cartesian)
      const distance = getSpaceDistance([circleCenter.current!, geo])
      radius.current = distance
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 右键结束
    handler.setInputAction(() => {
      setTrue()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    return () => {
      handler.destroy()
    }
  }, [viewer])

  const handleConfirm = async (data: any) => {
    if (!circleCenter.current) {
      return
    }
    const uuid = v4()

    const strokeColorHex = getHexWithAlpha(drawingColor, 1)
    const strokeColorARGB = hexToARGB(strokeColorHex)
    const fillColorHex = getHexWithAlpha(drawingColor, 0.5)
    const fillColorARGB = hexToARGB(fillColorHex)

    const commitData = {
      ...data,
      overlayType: 'CIRCULAR',
      overlayPositions: JSON.stringify([
        [...circleCenter.current, radius.current],
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
            '-major': `${radius.current}`, //椭圆形的最长距离
            '-minor': `${radius.current}`, //椭圆形的最短距离
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
        strokeWeight: {
          //描边宽度
          '-value': '2.0',
        },
        strokeStyle: {
          '-value': 'solid',
        },
        remarks: '',
      }),
      cotType: CotType.SHAPE_CIRCLE,
    }

    await createOverlay(commitData)
    onSuccess?.()
  }

  return (
    <AddFormModal
      open={open}
      onClose={() => {
        setFalse()
        circleCenter.current = null
      }}
      onConfirm={handleConfirm}
    />
  )
})

DrawCircle.displayName = 'DrawCircle'

export default DrawCircle
