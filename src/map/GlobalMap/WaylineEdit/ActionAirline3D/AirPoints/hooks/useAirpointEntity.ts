import { useEffect, useRef } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { AirlinePoint } from '@/store/wayline/uav-airline/types'
import { attempt } from 'lodash'

export const useAirpointEntity = (
  point: AirlinePoint,
  currentIndex: number,
  deltaHeight: number,
) => {
  const { viewer } = useCesium()

  const entityRef = useRef<Cesium.Entity | null>(null)
  const bottomRef = useRef<Cesium.Entity | null>(null)
  const idx = point.positionIndex ?? 0

  useEffect(() => {
    if (!viewer?.scene) return
    const { pointX, pointY, pointZ } = point

    // 航点
    const position = Cesium.Cartesian3.fromDegrees(
      pointX,
      pointY,
      pointZ + deltaHeight,
    )
    entityRef.current = viewer.entities.add({
      position,
      billboard: {
        image:
          idx === currentIndex
            ? '/images/airline/inverted-triangle-active.svg'
            : '/images/airline/inverted-triangle.svg',
        scale: 1.1,
        eyeOffset: new Cesium.Cartesian3(0, 0, -10),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: idx + 1 + '',
        font: 'bold 16px sans-serif',
        pixelOffset: new Cesium.Cartesian2(0, -3),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -20.0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      properties: {
        point: point,
        xtype: 'airpoint',
      },
    })

    // 地形点
    const bottomPosition = Cesium.Cartesian3.fromDegrees(pointX, pointY, 0)
    bottomRef.current = viewer.entities.add({
      position: bottomPosition,
      billboard: {
        image: '/images/airline/ground-point.svg',
        scale: 0.8,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })

    return () => {
      attempt(() => {
        if (entityRef.current) {
          viewer?.entities?.remove(entityRef.current)
        }
        if (bottomRef.current) {
          viewer?.entities?.remove(bottomRef.current)
        }
      })
    }
  }, [currentIndex, deltaHeight, idx, point, viewer])

  return entityRef
}
