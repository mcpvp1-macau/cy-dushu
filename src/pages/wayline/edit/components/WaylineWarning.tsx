import useAirlineConfigStore, {
  Warning,
} from '@/store/wayline/uav-airline/useAirlineConfig.store'
import SnackBar from '@/components/ui/SnackBar'

type PropsType = unknown

const WaylineWarning: FC<PropsType> = () => {
  const warningSet = useAirlineConfigStore((s) => s.warningSet)

  const { t } = useTranslation()

  return (
    <>
      <SnackBar open={!!warningSet.size} background="rgba(212, 107, 30, 0.75)">
        <div>
          {warningSet.has(Warning.DistanceBetweenWaypoints) && (
            <p>{t('wayline.distanceWarning.msg', { meters: 2000 })}</p>
          )}
          {warningSet.has(Warning.CollisionTerrain) ? (
            <p>{t('wayline.collisionWarning.msg')}</p>
          ) : (
            warningSet.has(Warning.NearTerrain) && (
              <p>{t('wayline.nearTerrain.msg')}</p>
            )
          )}
          {warningSet.has(Warning.InNoFlyZone) && (
            <p>{t('wayline.inNoFlyZone.msg')}</p>
          )}
        </div>
      </SnackBar>
    </>
  )
}

const memorizedCpn = memo(WaylineWarning)
memorizedCpn.displayName = 'WaylineWarning'

export default memorizedCpn
