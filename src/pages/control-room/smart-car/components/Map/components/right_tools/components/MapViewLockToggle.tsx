import FloatIconButton from '@/components/ui/button/FloatIconButton'
import IconUavMapFollow from '@/assets/icons/jsx/IconUavMapFollow'
import { useSmartCarControlRoomStore } from '@/store/context-store/useSmartCarControlRoom.store'

const MapViewLockToggle: FC = memo(() => {
  const { t } = useTranslation()
  const mapViewLocked = useSmartCarControlRoomStore(
    (s) => s.lockSmartCarMapView,
  )
  const updateMapViewLocked = useSmartCarControlRoomStore(
    (s) => s.updateLockSmartCarMapView,
  )

  return (
    <FloatIconButton
      tippyProps={{
        content: t('smartCar.mapViewLock.title', {
          defaultValue: '智慧警车地图跟随',
        }),
        placement: 'left',
      }}
      active={mapViewLocked}
      onClick={() => updateMapViewLocked(!mapViewLocked)}
    >
      <IconUavMapFollow className="text-xl" />
    </FloatIconButton>
  )
})

MapViewLockToggle.displayName = 'MapViewLockToggle'

export default MapViewLockToggle
