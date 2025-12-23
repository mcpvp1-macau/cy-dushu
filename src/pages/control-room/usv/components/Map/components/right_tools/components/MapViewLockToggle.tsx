import FloatIconButton from '@/components/ui/button/FloatIconButton'
import IconUavMapFollow from '@/assets/icons/jsx/IconUavMapFollow'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'

const MapViewLockToggle: FC = memo(() => {
  const { t } = useTranslation()
  const mapViewLocked = useUsvControlRoomStore((s) => s.lockUsvMapView)
  const updateMapViewLocked = useUsvControlRoomStore(
    (s) => s.updateLockUsvMapView,
  )

  return (
    <FloatIconButton
      tippyProps={{
        content: t('usv.mapViewLock.title', {
          defaultValue: 'USV map follow',
        }),
        placement: 'left',
      }}
      active={mapViewLocked}
      onClick={() => updateMapViewLocked(!mapViewLocked)}
    >
      <IconUavMapFollow />
    </FloatIconButton>
  )
})

MapViewLockToggle.displayName = 'MapViewLockToggle'

export default MapViewLockToggle
