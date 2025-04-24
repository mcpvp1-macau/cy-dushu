import { argbToHex } from '@/utils/color'
import { shouldJson } from '@/utils/json'
import { attempt, flatten } from 'lodash'
import { memo, type FC } from 'react'
import { Label, useCesium } from 'resium'
import * as Cesium from 'cesium'
import * as turf from '@turf/turf'
import { useMapLayerAndOverlayConfigStore } from '@/store/map/useLayerAndOverlay.store'

type PropsType = {
  data: API_LAYER_OVERLAY.domain.Overlay
}

const OverlayPolygon: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()

  const hiddenOverlayIds = useMapLayerAndOverlayConfigStore(
    (s) => s.hiddenOverlayIds,
  )
  const hiddenLayerIds = useMapLayerAndOverlayConfigStore(
    (s) => s.hiddenLayerIds,
  )

  const isHidden =
    hiddenOverlayIds.has(data.overlayId) || hiddenLayerIds.has(data.layerId)

  useEffect(() => {
    if (!viewer || isHidden) {
      return
    }

    const overlayPositions = shouldJson(data.overlayPositions)

    if (!overlayPositions) {
      return
    }

    const positions = Cesium.Cartesian3.fromDegreesArray(
      flatten(overlayPositions.map((e) => [e[0], e[1]])),
    )

    const styleConfig = shouldJson(data.overlayStyleConfig)
    const fill = argbToHex(String(styleConfig?.fillColor?.['-value']))?.[0]
    const stroke = argbToHex(String(styleConfig?.strokeColor?.['-value']))?.[0]

    // 创建多边形几何实例
    const instance1 = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        extrudedHeight: 0,
      }),
      id: `overlay--${data.overlayId}--${data.overlayType}`,
    })

    // 创建边界线几何实例
    const instance2 = new Cesium.GeometryInstance({
      geometry: new Cesium.GroundPolylineGeometry({
        positions: [...positions, positions[0]],
      }),
    })

    const primitive = new Cesium.GroundPrimitive({
      geometryInstances: [instance1], //可以是实例数组
      appearance: new Cesium.MaterialAppearance({
        translucent: true,
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString(fill).withAlpha(0.3),
        }),
      }),
      allowPicking: true,
    })
    const outlinePrimitive = new Cesium.GroundPolylinePrimitive({
      geometryInstances: [instance2],
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString(stroke),
        }),
      }),
    })
    viewer.scene.primitives.add(primitive)
    viewer.scene.primitives.add(outlinePrimitive)

    return () => {
      attempt(() => {
        viewer.scene.primitives.remove(primitive)
        viewer.scene.primitives.remove(outlinePrimitive)
      })
    }
  }, [viewer, isHidden, data.overlayStyleConfig])

  const center = turf.center(
    turf.points(shouldJson(data.overlayPositions) ?? []),
  )

  if (isHidden) {
    return null
  }

  return (
    <Label
      position={Cesium.Cartesian3.fromDegrees(
        center.geometry.coordinates[0],
        center.geometry.coordinates[1],
        0,
      )}
      scale={0.2}
      verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
      horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
      text={data.overlayName}
      outlineColor={Cesium.Color.fromCssColorString('#000')}
      outlineWidth={5}
      font="700 64px Helvetica"
      pixelOffset={new Cesium.Cartesian2(0, 0)}
      backgroundColor={Cesium.Color.BLACK}
      fillColor={Cesium.Color.WHITE}
      disableDepthTestDistance={50000}
      style={Cesium.LabelStyle.FILL_AND_OUTLINE}
      heightReference={Cesium.HeightReference.NONE}
      distanceDisplayCondition={new Cesium.DistanceDisplayCondition(0, 200_000)}
    />
  )
})

OverlayPolygon.displayName = 'OverlayPolygon'

export default OverlayPolygon
