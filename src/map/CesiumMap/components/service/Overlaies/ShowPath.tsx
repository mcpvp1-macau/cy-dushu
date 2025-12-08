import { shouldJson } from '@/utils/json'

import OverlayPath from './OverlayPath'
import { argbToHex } from '@/utils/color'
import * as Cesium from 'cesium'

type PropsType = {
  overlayExtType: 'overlay' | 'flightArea' | 'deviceOverlay'
  primitives: Cesium.PrimitiveCollection | undefined
  overlay: API_LAYER_OVERLAY.domain.Overlay
  isGround?: boolean
}

const ShowPath: FC<PropsType> = ({
  overlayExtType,
  primitives,
  overlay,
  isGround = true,
}) => {
  const positions = shouldJson(overlay.overlayPositions)
  const style = shouldJson(overlay.overlayStyleConfig)

  const strokeColor =
    argbToHex(String(style?.strokeColor?.['-value']))?.[0] || '#4c90f0'
  const strokeStyle = style?.strokeStyle?.['-value'] || 'solid'
  const strokeWeight = style?.strokeWeight?.['-value'] || 2
  const label = overlay.overlayName

  return (
    <>
      {primitives && (
        <OverlayPath
          data={`${overlayExtType}--${overlay.overlayId}`}
          primitives={primitives}
          isGround={isGround}
          asynchronous={false}
          path={positions}
          stroke={strokeColor}
          strokeStyle={strokeStyle}
          strokeWeight={strokeWeight}
          label={label}
          showPoints={true}
        />
      )}
    </>
  )
}

ShowPath.displayName = 'ShowPath'

export default memo(ShowPath)
