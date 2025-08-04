import useDeviceOverlaiesStore from '@/store/map/useDeviceOverlays.store'
import { emtpyArray } from '@/constant/data'
import { CotType } from '@/store/map/useDraw.store'
import ShowCircle from '@/map/CesiumMap/components/service/Overlaies/ShowCircle'
import ShowPolygon from '@/map/CesiumMap/components/service/Overlaies/ShowPolygon'
import ShowFan from '@/map/CesiumMap/components/service/Overlaies/ShowFan'

type PropsType = {
  deviceId: string
}

const DeviceOverlays: FC<PropsType> = memo(({ deviceId }) => {
  const deviceOverlays = useDeviceOverlaiesStore(
    (s) => s.deviceOverlays[deviceId] ?? emtpyArray,
  )

  return deviceOverlays.map((overlay) => {
    if (overlay.cotType === CotType.SHAPE_CIRCLE) {
      return (
        <ShowCircle
          key={overlay.overlayId}
          overlayExtType={'deviceOverlay'}
          overlay={overlay}
        />
      )
    }
    if (
      overlay.cotType === CotType.SHAPE_POLYGON ||
      overlay.cotType === CotType.SHAPE_RECT
    ) {
      return (
        <ShowPolygon
          key={overlay.overlayId}
          overlayExtType={'deviceOverlay'}
          overlay={overlay}
        />
      )
    }
    if (overlay.cotType === CotType.SHAPE_FAN) {
      return (
        <ShowFan
          key={overlay.overlayId}
          overlayExtType={'deviceOverlay'}
          overlay={overlay}
        />
      )
    }
  })
})

DeviceOverlays.displayName = 'DeviceOverlays'

export default DeviceOverlays
