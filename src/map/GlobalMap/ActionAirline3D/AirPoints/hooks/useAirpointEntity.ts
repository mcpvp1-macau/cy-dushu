import { useEffect, useRef } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { AirlinePoint } from '@/store/uav/uav-airline/types'

export const useAirpointEntity = (
  point: AirlinePoint,
  currentIndex: number,
) => {
  const { viewer } = useCesium()

  const entityRef = useRef<Cesium.Entity | null>(null)
  const lineRef = useRef<Cesium.Entity | null>(null)
  const bottomRef = useRef<Cesium.Entity | null>(null)
  const idx = point.positionIndex ?? 0

  useEffect(() => {
    if (!viewer?.scene) return
    const { pointX, pointY, pointZ } = point

    // 航点
    const position = Cesium.Cartesian3.fromDegrees(pointX, pointY, pointZ)
    entityRef.current = viewer.entities.add({
      position,
      billboard: {
        image: '/images/airline/inverted-triangle.svg',
        scale: 1.1,
        eyeOffset: new Cesium.Cartesian3(0, 0, -5),
      },
      label: {
        text: idx + 1 + '',
        font: 'bold 16px sans-serif',
        pixelOffset: new Cesium.Cartesian2(0, -3),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -10.0),
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
    const dashPostions = new Cesium.CallbackProperty((_, result) => {
      const positions = [position, bottomPosition]
      if (Cesium.defined(result)) {
        result.length = 0 // 清空现有数组
        result.push(...positions)
      }
      return positions
    }, false)
    // 航点与地形点之间的虚线
    lineRef.current = viewer.entities.add({
      polyline: {
        positions: dashPostions,
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString(
            idx === currentIndex ? '#FFF67F' : '#fff',
          ),
          dashLength: 8,
        }),
      },
    })

    // const circleGeometry = new Cesium.CircleGeometry({
    //   center: position,
    //   height: pointZ,
    //   radius: 20,
    // });

    // const circleInstance = new Cesium.GeometryInstance({
    //   geometry: circleGeometry,
    //   id: 'circle',
    //   attributes: {
    //     color: Cesium.ColorGeometryInstanceAttribute.fromColor(
    //       Cesium.Color.fromCssColorString('#fff'),
    //     ),
    //   },
    // });

    // const p = new Cesium.Primitive({
    //   geometryInstances: [circleInstance],
    //   appearance: new Cesium.PerInstanceColorAppearance({
    //     flat: true,
    //     renderState: {
    //       depthTest: {
    //         enabled: true,
    //       },
    //     },
    //   }),
    // });

    // viewer.scene.primitives.add(p);

    return () => {
      try {
        if (entityRef.current) {
          viewer?.entities?.remove(entityRef.current)
        }
        if (bottomRef.current) {
          viewer?.entities?.remove(bottomRef.current)
        }
        if (lineRef.current) {
          viewer?.entities?.remove(lineRef.current)
        }
      } catch (error) {}

      // viewer.scene.primitives.remove(p);
    }
  }, [point, currentIndex])

  return entityRef
}
