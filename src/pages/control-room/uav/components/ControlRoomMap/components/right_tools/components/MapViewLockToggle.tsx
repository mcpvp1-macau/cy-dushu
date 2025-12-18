import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'

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
          defaultValue: 'Lock UAV map view',
        }),
        placement: 'left',
      }}
      active={mapViewLocked}
      onClick={() => updateMapViewLocked(!mapViewLocked)}
    >
      {mapViewLocked ? <LockOutlined /> : <UnlockOutlined />}
    </FloatIconButton>
  )
})

MapViewLockToggle.displayName = 'MapViewLockToggle'

export default MapViewLockToggle
