import {
  OverlayCirclePrimitive,
  PrimitiveType,
} from '@/utils/customPrimitive/OverlayPrimitive'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import React, { FC, useEffect, useRef } from 'react'

interface Props {
  data: any
  primitives: Cesium.PrimitiveCollection
  center: [number, number] | [number, number, number]
  radius: number
  asynchronous: boolean
  isGround?: boolean
  primitiveType?: PrimitiveType
  /**飞行区域的高度 */
  flightAreaHeight?: number
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
    primitives,
    center,
    radius,
    asynchronous,
    isGround = true,
    primitiveType = 'OVERLAY',
    flightAreaHeight = 0,
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
    new OverlayCirclePrimitive({
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
      primitiveType,
      flightAreaHeight,
    }),
  )

  useEffect(() => {
    primitiveRef.current.setProps(data)
    primitiveRef.current.primitiveType = primitiveType
    primitiveRef.current.flightAreaHeight = flightAreaHeight
  }, [data, primitiveType, flightAreaHeight])

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
  }, [primitives])

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
