import * as Cesium from 'cesium'
import { OverlayPolygonPrimitive } from '@/utils/customPrimitive/OverlayPrimitive'
import { attempt } from 'lodash'

type PropsType = {
  data: any
  primitives: Cesium.PrimitiveCollection
  path: number[][] // [[111,111,111], [222,222,222]]
  asynchronous: boolean
  isGround?: boolean
  hide?: 0 | 1
  fill?: string
  stroke?: string
  fillOpacity?: number
  label?: string
  strokeStyle?: 'solid' | 'dashed' | 'no-fly'
  strokeWeight?: number
}

/**用于渲染覆盖物多边形与矩形 */
const OverlayPolygon: FC<PropsType> = memo((props) => {
  const {
    data,
    primitives,
    path,
    asynchronous,
    isGround = true,
    hide = false,
    fill = '#4c90f0',
    stroke = '#4c90f0',
    label = '',
    fillOpacity = 0,
    strokeStyle = 'solid',
    strokeWeight = 2,
  } = props

  const primitiveRef = useRef(
    new OverlayPolygonPrimitive({
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
    primitiveRef.current.positions = path as [number, number][]
  }, [path])

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

OverlayPolygon.displayName = 'OverlayPolygon'

export default OverlayPolygon
