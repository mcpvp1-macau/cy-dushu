import { getDistance } from '@/utils/other/utils'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import SnackBar from '@/components/ui/SnackBar'

type PropsType = unknown

const DistanceWarning: FC<PropsType> = () => {
  const currentIndex = useAirlineConfigStore((s) => s.currentIndex)
  const airpoints = useAirlineConfigStore((s) => s.airpointsConfig)
  const takeoffPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )

  const { pointX, pointY, pointZ } = airpoints[currentIndex] ?? {}
  let {
    pointX: lastPointX,
    pointY: lastPointY,
    pointZ: lastPointZ,
  } = airpoints[currentIndex - 1] ?? {}
  if (currentIndex === 0) {
    lastPointX = takeoffPoint?.[0] ?? 0
    lastPointY = takeoffPoint?.[1] ?? 0
    lastPointZ = pointZ
  }

  const d = getDistance([
    [lastPointX, lastPointY, lastPointZ],
    [pointX, pointY, pointZ],
  ])

  const { t } = useTranslation()

  return (
    <>
      <SnackBar
        open={!isNaN(d) && d > 2000}
        background="rgba(212, 107, 30, 0.75)"
      >
        {t('wayline.distanceWarning.msg', { meters: 2000 })}
      </SnackBar>
    </>
  )
}

const memorizedCpn = memo(DistanceWarning)
memorizedCpn.displayName = 'DistanceWarning'

export default memorizedCpn
