import { shouldJson } from '@/utils/json'
import { useCesium } from 'resium'
import OverlayPolygon from './OverlayPolygon'
import { argbToHex } from '@/utils/color'

type PropsType = {
  overlay: API_LAYER_OVERLAY.domain.Overlay
}

const ShowPolygon: FC<PropsType> = ({ overlay }) => {
  const { viewer } = useCesium()

  const positions = shouldJson(overlay.overlayPositions)
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
        <OverlayPolygon
          data={`overlay--${overlay.overlayId}`}
          viewer={viewer}
          asynchronous={false}
          path={positions}
          label={label}
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

export default ShowPolygon
