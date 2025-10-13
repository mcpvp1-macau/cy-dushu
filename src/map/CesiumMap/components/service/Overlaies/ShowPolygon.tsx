import { shouldJson } from '@/utils/json'
import { useCesium } from 'resium'
import OverlayPolygon from './OverlayPolygon'
import { argbToHex } from '@/utils/color'
import * as Cesium from 'cesium'

type PropsType = {
  overlayExtType: 'overlay' | 'flightArea' | 'deviceOverlay'
  primitives: Cesium.PrimitiveCollection | undefined
  overlay: API_LAYER_OVERLAY.domain.Overlay
  isGround?: boolean
  showLabel?: boolean
}

const ShowPolygon: FC<PropsType> = ({
  overlayExtType,
  primitives,
  overlay,
  isGround = true,
  showLabel = true,
}) => {
  const positions = shouldJson(overlay.overlayPositions)
  const style = shouldJson(overlay.overlayStyleConfig)
  const primitiveType = overlay.overlayExtType
  const flightAreaHeight = (overlay as any).overlayHeight
    ? Number((overlay as any).overlayHeight)
    : 0

  const label = overlay.overlayName
  const fillColor =
    argbToHex(String(style?.fillColor?.['-value']))?.[0] || '#4c90f0'
  const fillOpacity = parseFloat(style?.fillOpacity?.['-value']) || 0.5
  const strokeColor =
    argbToHex(String(style?.strokeColor?.['-value']))?.[0] || '#4c90f0'
  const strokeStyle = style?.strokeStyle?.['-value'] || 'solid'
  const strokeWeight = style?.strokeWeight?.['-value'] || 2

  return (
    <>
      {primitives && (
        <OverlayPolygon
          data={`${overlayExtType}--${overlay.overlayId}`}
          primitives={primitives}
          isGround={isGround}
          asynchronous={false}
          path={positions}
          label={showLabel ? label : undefined}
          primitiveType={primitiveType}
          flightAreaHeight={flightAreaHeight}
          fill={fillColor}
          fillOpacity={fillOpacity}
          stroke={strokeColor}
          strokeStyle={strokeStyle}
          strokeWeight={strokeWeight}
        ></OverlayPolygon>
      )}
    </>
  )
}

ShowPolygon.displayName = 'ShowPolygon'

export default memo(ShowPolygon)
