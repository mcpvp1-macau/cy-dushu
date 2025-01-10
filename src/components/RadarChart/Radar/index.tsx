import * as turf from '@turf/turf'
import { useDeepCompareEffect } from 'ahooks'
import { Leafer, Line } from 'leafer-ui'
import _ from 'lodash'
import React from 'react'

interface LngLatPoint {
  lng: number
  lat: number
}

interface Props {
  leafer?: Leafer
  center: LngLatPoint
  radarRangeData?: LngLatPoint[]
  R?: number
  max?: number
  /**
   * @description 0度角
   */
  angle?: number
  left?: number
  top?: number
  right?: number
  bottom?: number
}

const Radar: React.FC<Props> = (props) => {
  const {
    leafer,
    center,
    radarRangeData,
    R = 100,
    max = 1000,
    angle = 0,
    left = 10,
    // right = 10,
    top = 10,
    // bottom = 10,
  } = props

  function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180)
  }
  useDeepCompareEffect(() => {
    const centerPoint = turf.point([center.lng, center.lat])
    const list = radarRangeData?.map((item) => {
      const point = turf.point([item.lng, item.lat])
      const bearing = turf.rhumbBearing(centerPoint, point)
      const distance =
        turf.distance(centerPoint, point, {
          units: 'kilometers',
        }) * 1000
      return {
        bearing,
        distance,
        x:
          left +
          R +
          R * (distance / max) * Math.cos(degreesToRadians(bearing - angle)),
        y:
          top +
          R +
          R * (distance / max) * Math.sin(degreesToRadians(bearing - angle)),
      }
    })

    const positions = _.flatten(
      list?.map((item) => {
        return [item.x, item.y]
      }),
    )

    const line = new Line({
      points: positions, // [x,y, x,y ...]
      cornerRadius: 5,
      strokeWidth: 1,
      stroke: 'rgba(50,205,121, 0.8)',
    })

    leafer?.add(line)

    return () => {
      leafer?.remove(line)
    }
  }, [center, radarRangeData, R, max])
  return <></>
}

export default React.memo(Radar)
