import { argbToHex } from '@/utils/color'
import { shouldJson } from '@/utils/json'
import { memo, type FC } from 'react'
import { Label, PointPrimitive } from 'resium'
import * as Cesium from 'cesium'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'
import { useMapLayerAndOverlayConfigStore } from '@/store/map/useLayerAndOverlay.store'

type PropsType = {
  data: API_LAYER_OVERLAY.domain.Overlay
}

/** 覆盖物 - 打点 */
const OverlayPoint: FC<PropsType> = memo(({ data }) => {
  const postion = shouldJson(data.overlayPositions)?.[0]

  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  const hiddenOverlayIds = useMapLayerAndOverlayConfigStore(
    (s) => s.hiddenOverlayIds,
  )
  const hiddenLayerIds = useMapLayerAndOverlayConfigStore(
    (s) => s.hiddenLayerIds,
  )
  if (
    hiddenOverlayIds.has(data.overlayId) ||
    hiddenLayerIds.has(data.layerId)
  ) {
    return null
  }

  if (!postion) {
    return null
  }

  const styleConfig = shouldJson(data.overlayStyleConfig)
  const isTransparent = styleConfig.color['-argb'] === '0'
  const hex = isTransparent
    ? '0'
    : argbToHex(String(styleConfig.color['-argb']))[0]
  const position = Cesium.Cartesian3.fromDegrees(
    postion[0],
    postion[1],
    postion[2] ?? 0,
  )

  const handleDblClick = () => {
    updateRightMode(RightModeEnum.POINT_DETAIL)
    updateDetailId(data.overlayId + '')
  }

  return (
    <>
      <PointPrimitive
        color={Cesium.Color.fromCssColorString(hex)}
        pixelSize={10}
        id={`overlay--${data.overlayId}`}
        outlineColor={Cesium.Color.fromCssColorString('#fff')}
        outlineWidth={1}
        position={position}
        show={true}
        onDoubleClick={handleDblClick}
      />
      <Label
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
        disableDepthTestDistance={50000}
        style={Cesium.LabelStyle.FILL_AND_OUTLINE}
        heightReference={Cesium.HeightReference.NONE}
        distanceDisplayCondition={
          new Cesium.DistanceDisplayCondition(0, 500_000)
        }
      />
    </>
  )
})

OverlayPoint.displayName = 'OverlayPoint'

export default OverlayPoint
