import { shouldJson } from '@/utils/json'
import { useCesium } from 'resium'
import OverlayFan from './OverlayFan'
import { argbToHex } from '@/utils/color'
import * as Cesium from 'cesium'

type PropsType = {
  primitives: Cesium.PrimitiveCollection | undefined
  overlay: API_LAYER_OVERLAY.domain.Overlay
  isGround?: boolean
  showLabel?: boolean
}

const ShowFan: FC<PropsType> = ({
  primitives,
  overlay,
  isGround = true,
  showLabel = true,
}) => {
  const positions = shouldJson(overlay.overlayPositions) || []
  const style = shouldJson(overlay.overlayStyleConfig)

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
        <OverlayFan
          data={`${overlay.overlayExtType ? 'flightArea' : 'overlay'}--${
            overlay.overlayId
          }`}
          primitives={primitives}
          isGround={isGround}
          asynchronous={false}
          positions={positions}
          label={showLabel ? label : undefined}
          fill={fillColor}
          fillOpacity={fillOpacity}
          stroke={strokeColor}
          strokeStyle={strokeStyle}
          strokeWeight={strokeWeight}
        ></OverlayFan>
      )}
    </>
  )
}

ShowFan.displayName = 'ShowFan'

export default ShowFan
