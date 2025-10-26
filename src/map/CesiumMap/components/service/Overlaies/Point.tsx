import { argbToHex } from '@/utils/color'
import { shouldJson } from '@/utils/json'
import { Label, PointPrimitive, useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useMapLayerAndOverlayConfigStore } from '@/store/map/useLayerAndOverlay.store'

type PropsType = {
  data: API_LAYER_OVERLAY.domain.Overlay
}

/** 覆盖物 - 打点 */
const OverlayPoint: FC<PropsType> = memo(({ data }) => {
  const postion = shouldJson(data.overlayPositions)?.[0]

  const hiddenOverlayIds = useMapLayerAndOverlayConfigStore(
    (s) => s.hiddenOverlayIds,
  )

  const { viewer } = useCesium()

  if (hiddenOverlayIds.has(data.overlayId)) {
    return null
  }

  if (!postion) {
    return null
  }

  const position = Cesium.Cartesian3.fromDegrees(
    postion[0],
    postion[1],
    postion[2] ??
      viewer?.scene.globe.getHeight(
        Cesium.Cartographic.fromDegrees(postion[0], postion[1]),
      ) ??
      0,
  )

  return (
    <>
      <PointPrimitive
        id={`overlay--${data.overlayId}`}
        position={position}
        color={Cesium.Color.fromCssColorString(
          argbToHex(
            String(shouldJson(data.overlayStyleConfig).color['-argb']),
          )[0],
        )}
        pixelSize={10}
        outlineColor={Cesium.Color.fromCssColorString('#fff')}
        outlineWidth={1}
        disableDepthTestDistance={16_000_000}
      />
      <Label
        id={`overlay--${data.overlayId}`}
        position={position}
        scale={0.2}
        verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
        horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        text={data.overlayName}
        outlineColor={Cesium.Color.fromCssColorString('#000')}
        outlineWidth={5}
        font="700 64px Helvetica"
        pixelOffset={new Cesium.Cartesian2(0, 20)}
        backgroundColor={Cesium.Color.BLACK}
        fillColor={Cesium.Color.WHITE}
        backgroundPadding={new Cesium.Cartesian2(5, 5)}
        disableDepthTestDistance={Infinity}
        style={Cesium.LabelStyle.FILL_AND_OUTLINE}
        distanceDisplayCondition={
          new Cesium.DistanceDisplayCondition(0, 200_000)
        }
      />
    </>
  )
})

OverlayPoint.displayName = 'OverlayPoint'

export default OverlayPoint
