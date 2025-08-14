import { FC, useContext } from 'react'
import ShowNoFlyArea from './ShowNoFlyArea'
import ShowDefaultArea from './ShowDefaultArea'
import { ARSceneCesiumContext } from '../../context'

type PropsType = {
  overlays: API_LAYER_OVERLAY.domain.Overlay[]
}

const ShowFlightArea: FC<PropsType> = ({ overlays }) => {
  const { ocrc } = useContext(ARSceneCesiumContext)

  return (
    <>
      {overlays.map((overlay) => {
        if (overlay.overlayExtType === 'NO_FLY_ZONE') {
          return (
            <ShowNoFlyArea
              key={overlay.overlayId}
              overlay={overlay}
              ocrc={ocrc!}
            />
          )
        }
        return (
          <ShowDefaultArea
            key={overlay.overlayId}
            overlay={overlay}
            ocrc={ocrc!}
          />
        )
      })}
    </>
  )
}

ShowFlightArea.displayName = 'ShowFlightArea'

export default ShowFlightArea
