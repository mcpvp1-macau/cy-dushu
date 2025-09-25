import { FC, memo } from 'react'
import RenderOverlayLabel from './RenderOverlayLabel'
import ShowFlightArea from './ShowFlightArea'

type PropsType = {
  overlays: API_LAYER_OVERLAY.domain.Overlay[]
}

const RenderFlightArea: FC<PropsType> = ({ overlays }) => {
  return (
    <>
      <ShowFlightArea overlays={overlays} />
      <RenderOverlayLabel overlays={overlays} />
    </>
  )
}

RenderFlightArea.displayName = 'RenderFlightArea'

export default memo(RenderFlightArea)
