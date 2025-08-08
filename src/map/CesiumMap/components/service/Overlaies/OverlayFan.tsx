import { memo, type FC } from 'react'
import * as Cesium from 'cesium'
import { OverlayFanPrimitive } from '@/utils/customPrimitive/OverlayPrimitive'
import { attempt } from 'lodash'

type PropsType = {
  data: any
  primitives: Cesium.PrimitiveCollection
  positions: number[][] // [[111,111,111], [222,222,222]]
  asynchronous: boolean
  isGround: boolean
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
    primitives,
    positions,
    asynchronous,
    isGround,
    hide = false,
    fill = '#4c90f0',
    stroke = '#4c90f0',
    label = '',
    fillOpacity = 0,
    strokeStyle = 'solid',
    strokeWeight = 2,
  } = props

  const primitiveRef = useRef(
    new OverlayFanPrimitive({
      styleOptions: {
        stroke,
        strokeStyle,
        strokeWeight,
        fill,
        fillOpacity,
        label,
      },
      asynchronous,
      props: data,
      isGround,
    }),
  )

  useEffect(() => {
    primitiveRef.current.setProps(data)
  }, [data])

  useEffect(() => {
    if (!primitives) return
    primitives.add(primitiveRef.current)

    return () => {
      attempt(() => {
        const preVal = primitives.destroyPrimitives
        primitives.destroyPrimitives = false
        primitives.remove(primitiveRef.current)
        primitives.destroyPrimitives = preVal
      })
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
