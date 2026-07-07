import CesiumMap from '@/map/CesiumMap'
import { FIXED_WING_DEMO_TELEMETRY } from '@/demo/fixed-wing/constants'
import * as Cesium from 'cesium'
import { Entity } from 'resium'

type PropsType = {
  deviceName: string
}

const telemetry = FIXED_WING_DEMO_TELEMETRY

/** 固定翼驾驶舱地图（真实 Cesium 地图 + 演示点位） */
const FixedWingMap: FC<PropsType> = memo(({ deviceName }) => {
  const planePosition = useMemo(
    () =>
      Cesium.Cartesian3.fromDegrees(
        telemetry.longitude,
        telemetry.latitude,
        telemetry.asl,
      ),
    [],
  )

  const targetPosition = useMemo(
    () =>
      Cesium.Cartesian3.fromDegrees(
        telemetry.targetLongitude,
        telemetry.targetLatitude,
        telemetry.targetAltitude,
      ),
    [],
  )

  const labelStyle = useMemo(
    () => ({
      font: '13px sans-serif',
      fillColor: Cesium.Color.WHITE,
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString('#101821').withAlpha(0.8),
      pixelOffset: new Cesium.Cartesian2(0, -24),
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    }),
    [],
  )

  return (
    <CesiumMap id="fixed-wing-control-room-map">
      {/* 飞机点位 (与多旋翼无人机同款图标) */}
      <Entity
        position={planePosition}
        billboard={{
          image: '/images/marker/icon/uav3.svg',
          width: 28,
          height: 28,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }}
        label={{ ...labelStyle, text: deviceName }}
      />
      {/* 目标定位点位 */}
      <Entity
        position={targetPosition}
        point={{
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString('#ef4444'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }}
        label={{ ...labelStyle, text: '目标定位点' }}
      />
      {/* 飞机与目标连线 */}
      <Entity
        polyline={{
          positions: [planePosition, targetPosition],
          width: 2,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.8),
          }),
          clampToGround: false,
        }}
      />
    </CesiumMap>
  )
})

FixedWingMap.displayName = 'FixedWingMap'

export default FixedWingMap
