import { memo, type FC } from 'react'
import { Label, useCesium } from 'resium'
import * as Cesium from 'cesium'
import { shouldJson } from '@/utils/json'
import { attempt } from 'lodash'
import { argbToHex } from '@/utils/color'
import { useMapLayerAndOverlayConfigStore } from '@/store/map/useLayerAndOverlay.store'

type PropsType = {
  data: API_LAYER_OVERLAY.domain.Overlay
}

/** 覆盖物 - 圆形 */
const OverlayCircle: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()

  const overlayPositions = shouldJson(data.overlayPositions)?.[0]
  const postion = overlayPositions?.slice(0, 3)

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
    const overlayPositions = shouldJson(data.overlayPositions)?.[0]
    if (!overlayPositions) {
      return
    }
    const postion = overlayPositions.slice(0, 3)
    const radius = overlayPositions[3]
    if (!postion || !radius) {
      return
    }

    const center = Cesium.Cartesian3.fromDegrees(
      postion[0],
      postion[1],
      postion[2] ?? 0,
    )

    const styleConfig = shouldJson(data.overlayStyleConfig)
    const fill = argbToHex(String(styleConfig?.fillColor?.['-value']))?.[0]
    const stroke = argbToHex(String(styleConfig?.strokeColor?.['-value']))?.[0]

    // 创建多边形几何实例
    const instance1 = new Cesium.GeometryInstance({
      id: `overlay--${data.overlayId}`,
      geometry: new Cesium.CircleGeometry({
        center,
        radius,
      }),

      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString(fill).withAlpha(0.4),
        ),
      },
    })

    const circlePrimitive = new Cesium.Primitive({
      allowPicking: true,
      geometryInstances: [instance1],
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
        flat: true,
        renderState: {
          depthTest: {
            enabled: false,
          },
        },
      }),
    })

    // 创建边界线几何实例
    const instance2 = new Cesium.GeometryInstance({
      geometry: new Cesium.CircleOutlineGeometry({
        center,
        radius,
      }),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString(stroke),
        ),
      },
    })

    const CircleOutlinePrimitive = new Cesium.Primitive({
      geometryInstances: [instance2],
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
        flat: true,
        renderState: {
          depthTest: {
            enabled: false,
          },
        },
      }),
    })

    viewer.scene.primitives.add(circlePrimitive)
    viewer.scene.primitives.add(CircleOutlinePrimitive)

    return () => {
      attempt(() => {
        viewer.scene.primitives.remove(circlePrimitive)
        viewer.scene.primitives.remove(CircleOutlinePrimitive)
      })
    }
  }, [viewer, isHidden])

  if (!postion || isHidden) {
    return null
  }

  return (
    <Label
      position={Cesium.Cartesian3.fromDegrees(postion[0], postion[1], 0)}
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
      // backgroundPadding={new Cesium.Cartesian2(5, 5)}
      disableDepthTestDistance={50000}
      style={Cesium.LabelStyle.FILL_AND_OUTLINE}
      heightReference={Cesium.HeightReference.NONE}
      distanceDisplayCondition={new Cesium.DistanceDisplayCondition(0, 500_000)}
    />
  )
})

OverlayCircle.displayName = 'OverlayCircle'

export default OverlayCircle
