import { memo, type FC } from 'react'
import * as Cesium from 'cesium'
import { OverlayFanPrimitive } from '@/utils/customPrimitive/OverlayPrimitive'

type PropsType = {
  data: any
  viewer: Cesium.Viewer
  positions: number[][] // [[111,111,111], [222,222,222]]
  asynchronous: boolean
  hide?: 0 | 1
  fill?: string
  stroke?: string
  fillOpacity?: number
  label?: string
  strokeStyle?: 'solid' | 'dashed' | 'no-fly'
  strokeWeight?: number
}

/**用于渲染覆盖物扇形 */
const OverlayFan: FC<PropsType> = memo((props) => {
  const {
    data,
    viewer,
    positions,
    asynchronous,
    hide = false,
    fill = '#4c90f0',
    stroke = '#4c90f0',
    label = '',
    fillOpacity = 0,
    strokeStyle = 'solid',
    strokeWeight = 2,
  } = props

  const primitiveRef = useRef(
    new OverlayFanPrimitive(
      {
        stroke,
        strokeStyle,
        strokeWeight,
        fill,
        fillOpacity,
        label,
      },
      asynchronous,
      data,
    ),
  )

  useEffect(() => {
    primitiveRef.current.setProps(data)
  }, [data])

  useEffect(() => {
    if (!viewer) return
    viewer.scene.primitives.add(primitiveRef.current)

    return () => {
      const preVal = viewer.scene.primitives.destroyPrimitives
      viewer.scene.primitives.destroyPrimitives = false
      viewer.scene.primitives.remove(primitiveRef.current)
      viewer.scene.primitives.destroyPrimitives = preVal
    }
  }, [])

  // 显示隐藏
  useEffect(() => {
    primitiveRef.current.show = !hide
  }, [hide])

  useEffect(() => {
    primitiveRef.current.positions = positions as [number, number][]
  }, [positions])

  useEffect(() => {
    const preOptions = primitiveRef.current.styleOptions
    primitiveRef.current.styleOptions = {
      ...preOptions,
      stroke,
      strokeStyle,
      strokeWeight,
      fill,
      fillOpacity,
      label,
    }
  }, [stroke, strokeStyle, strokeWeight, fill, fillOpacity, label])

  return null
})

OverlayFan.displayName = 'OverlayFan'

export default OverlayFan
