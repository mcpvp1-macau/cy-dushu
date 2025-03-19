import { useEffect, useRef } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { RebotDogWaypointConfigType } from '@/store/wayline/rebot-dog-wayline/types'

export const useWaypointEntity = (
  point: RebotDogWaypointConfigType,
  currentIndex: number,
) => {
  const { viewer } = useCesium()

  const entityRef = useRef<Cesium.Entity | null>(null)
  const idx = point.positionIndex ?? 0

  useEffect(() => {
    if (!viewer?.scene) return
    const { pointX, pointY, pointZ } = point

    // 航点
    const position = Cesium.Cartesian3.fromDegrees(pointX, pointY, pointZ)
    entityRef.current = viewer.entities.add({
      position,
      billboard: {
        image: '/images/airline/inverted-triangle-blue.svg',
        scale: 1.1,
        eyeOffset: new Cesium.Cartesian3(0, 0, -5),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: idx + 1 + '',
        font: 'bold 16px sans-serif',
        pixelOffset: new Cesium.Cartesian2(0, -3),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -10.0),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      properties: {
        point: point,
        xtype: 'airpoint',
      },
    })

    return () => {
      attempt(() => {
        if (entityRef.current) {
          viewer?.entities?.remove(entityRef.current)
        }
      })
    }
  }, [point, currentIndex])

  return entityRef
}
