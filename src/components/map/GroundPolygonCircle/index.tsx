import {
  GroundPolylinePrimitive,
  GroundPrimitive,
  GroundPrimitiveCollection,
  useCesium,
} from 'resium'
import { useCallback } from 'react'
import * as Cesium from 'cesium'
import * as _ from 'lodash'
import * as turf from '@turf/turf'
import RadarScanMaterialProperty from '@/map/GlobalMap/DeviceMarkers/OtherMarkers/radar'
type PropsType = {
  // positions: { lng: number; lat: number; altitude: number }[]
  lng: number
  lat: number
  scope: number
  color?: string
}

/** 带边框的贴地面 */
const GroundPolygonCircle: React.FC<PropsType> = ({
  lng,
  lat,
  scope = 10000,
  color = '#fff',
}) => {
  const positions = useMemo(() => {
    const center = [lng, lat]
    const radius = scope / 1000

    const circle = turf.circle(center, radius, {
      steps: 100,
      units: 'kilometers',
      properties: { foo: 'bar' },
    })
    return circle.geometry.coordinates
  }, [lng, lat, scope])

  const { viewer } = useCesium()

  const headingRef = useRef(0)

  useEffect(() => {

    const a = viewer?.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat),
      name: '雷达扫描',
      ellipse: {
        semiMajorAxis: scope,
        semiMinorAxis: scope,
        material: new RadarScanMaterialProperty({
          color: Cesium.Color.fromCssColorString(color),
          speed: 20.0,
        }),
        // height: 20.0,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString(color),
        outlineWidth: 10,
      },
    })

    return () => {
      // circleScan.clear()
      try {
        if (a) {
          viewer?.entities.remove(a)
        }
      } catch (_error) {}
    }
  }, [lng, lat, scope])

  // 计算竖直扇形
  const calculateSector = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    const positionArr: number[] = []
    positionArr.push(x1)
    positionArr.push(y1)
    positionArr.push(0)
    const radius = Cesium.Cartesian3.distance(
      Cesium.Cartesian3.fromDegrees(x1, y1),
      Cesium.Cartesian3.fromDegrees(x2, y2),
    )
    // 扇形是1/4圆，因此角度设置为0-90
    for (let i = 0; i <= 90; i++) {
      const h = radius * Math.sin((i * Math.PI) / 180.0)
      const r = Math.cos((i * Math.PI) / 180.0)
      const x = (x2 - x1) * r + x1
      const y = (y2 - y1) * r + y1
      positionArr.push(x)
      positionArr.push(y)
      positionArr.push(h)
    }
    return positionArr
  }, [])

  // 计算平面扫描范围
  const calculatePane = useCallback((x1, y1, radius, heading) => {
    const m = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(x1, y1),
    )
    const rx = radius * Math.cos((heading * Math.PI) / 180.0)
    const ry = radius * Math.sin((heading * Math.PI) / 180.0)
    const translation = Cesium.Cartesian3.fromElements(rx, ry, 0)
    const d = Cesium.Matrix4.multiplyByPoint(
      m,
      translation,
      new Cesium.Cartesian3(),
    )
    const c = Cesium.Cartographic.fromCartesian(d)
    const x2 = Cesium.Math.toDegrees(c.longitude)
    const y2 = Cesium.Math.toDegrees(c.latitude)
    return calculateSector(x1, y1, x2, y2)
  }, [calculateSector])

  useEffect(() => {
    const radar = viewer?.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat, 100),
      name: '立体雷达扫描',
      ellipsoid: {
        radii: new Cesium.Cartesian3(scope, scope, scope),
        material: Cesium.Color.fromCssColorString(color).withAlpha(0.1),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString(color),
        outlineWidth: 1,
        maximumCone: Cesium.Math.toRadians(90),
      },
      wall: {
        positions: new Cesium.CallbackProperty(() => {
          headingRef.current += 1
          return Cesium.Cartesian3.fromDegreesArrayHeights(
            calculatePane(lng, lat, scope, headingRef.current),
          )
        }, false),
        material: Cesium.Color.fromCssColorString(color).withAlpha(0.5),
        // minimumHeights: arr.bottomArr,
      },
    })
    return () => {
      if (radar) {
        viewer?.entities.remove(radar)
      }
    }
  }, [lng, lat, scope, viewer, color, calculatePane])

  // return null
  return (
    <>
      <GroundPrimitiveCollection>
        <GroundPolylinePrimitive
          geometryInstances={
            new Cesium.GeometryInstance({
              // id: 'PolylineGeometry',
              geometry: new Cesium.GroundPolylineGeometry({
                positions: Cesium.Cartesian3.fromDegreesArray(
                  _.flatten(_.flatten(positions)),
                ),
                width: 2.0,
              }),
            })
          }
          appearance={
            new Cesium.PolylineMaterialAppearance({
              material: Cesium.Material.fromType('Color', {
                color: Cesium.Color.fromCssColorString(color),
              }),
            })
          }
        />
        <GroundPrimitive
          geometryInstances={
            new Cesium.GeometryInstance({
              geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(
                  Cesium.Cartesian3.fromDegreesArray(
                    _.flatten(_.flatten(positions)),
                  ),
                ),
              }),
            })
          }
          appearance={
            new Cesium.MaterialAppearance({
              material: Cesium.Material.fromType('Color', {
                color: Cesium.Color.fromCssColorString(color).withAlpha(0.2),
              }),
            })
          }
        />
      </GroundPrimitiveCollection>
    </>
  )
}

export default GroundPolygonCircle
