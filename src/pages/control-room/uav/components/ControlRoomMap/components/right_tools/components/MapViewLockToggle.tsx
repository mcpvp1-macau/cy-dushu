import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import IconUavMapFollow from '@/assets/icons/jsx/IconUavMapFollow'

const MapViewLockToggle: FC = memo(() => {
  const { t } = useTranslation()
  const mapViewLocked = useUavControlRoomStore((s) => s.lockUavMapView)
  const updateMapViewLocked = useUavControlRoomStore(
    (s) => s.updateLockUavMapView,
  )

  return (
    <FloatIconButton
      tippyProps={{
        content: t('uav.mapViewLock.title', {
          defaultValue: 'UAV map follow',
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
