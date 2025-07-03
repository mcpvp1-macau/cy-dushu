import { shouldJson } from '@/utils/json'
import { useCesium } from 'resium'
import OverlayCircle from './OverlayCircle'
import { argbToHex } from '@/utils/color'

type PropsType = {
  overlayExtType: 'overlay' | 'flightArea'
  overlay: API_LAYER_OVERLAY.domain.Overlay
}

const ShowCircle: FC<PropsType> = ({ overlayExtType, overlay }) => {
  const { viewer } = useCesium()

  const position = shouldJson(overlay.overlayPositions)?.[0]
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
      {viewer && (
        <OverlayCircle
          data={`${overlayExtType}--${overlay.overlayId}`}
          viewer={viewer}
          asynchronous={false}
          center={[position[0], position[1]]}
          radius={position[3]}
          label={label}
          fill={fillColor}
          fillOpacity={fillOpacity}
          stroke={strokeColor}
          strokeStyle={strokeStyle}
          strokeWeight={strokeWeight}
        ></OverlayCircle>
      )}
    </>
  )
}

ShowCircle.displayName = 'ShowCircle'

export default ShowCircle
