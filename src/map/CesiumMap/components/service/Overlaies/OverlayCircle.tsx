import { OverlayCirclePrimitive } from '@/utils/customPrimitive/OverlayPrimitive'
import * as Cesium from 'cesium'
import React, { FC, useEffect, useRef } from 'react'

interface Props {
  data: any
  viewer: Cesium.Viewer
  center: [number, number]
  radius: number
  asynchronous: boolean
  label?: string
  hide?: 0 | 1
  fill?: string
  stroke?: string
  fillOpacity?: number
  strokeStyle?: 'solid' | 'dashed' | 'no-fly'
  strokeWeight?: number
}

/**用于渲染覆盖物圆形 */
const OverlayCircle: FC<Props> = (props) => {
  let {
    data,
    viewer,
    center,
    radius,
    asynchronous,
    hide = false,
    fill = '#4c90f0',
    stroke = '#4c90f0',
    label = '',
    fillOpacity = 0,
    strokeStyle = 'solid',
    strokeWeight = 2,
  } = props

  radius = radius <= 1 ? 1 : radius

  const primitiveRef = useRef(
    new OverlayCirclePrimitive(
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
      if (!viewer) return

      const preVal = viewer.scene.primitives.destroyPrimitives
      viewer.scene.primitives.destroyPrimitives = false
      viewer.scene.primitives.remove(primitiveRef.current)
      viewer.scene.primitives.destroyPrimitives = preVal
    }
  }, [viewer])

  // 显示隐藏
  useEffect(() => {
    primitiveRef.current.show = !hide
  }, [hide])

  useEffect(() => {
    primitiveRef.current.center = center
    primitiveRef.current.radius = radius
  }, [center, radius])

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
}

OverlayCircle.displayName = 'OverlayCircle'

export default React.memo(OverlayCircle)
