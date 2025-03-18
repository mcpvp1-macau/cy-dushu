import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import { getSpaceDistance } from '@/utils/other/utils'
import * as turf from '@turf/turf'

type PropsType = unknown

const InfoCard: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const takeOffRefPoint = useAreaWaylineStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const airpointsConfig = useAreaWaylineStore((s) => s.airpointsConfig)

  const polygon = useAreaWaylineStore((s) => s.templateConfig.polygon)

  const speed = useAreaWaylineStore((s) => s.airlineConfig.speed)

  /** 航线距离 */
  const totalDistance = useMemo(() => {
    if (!takeOffRefPoint) return 0
    return getSpaceDistance(
      [takeOffRefPoint].concat(
        airpointsConfig.map((e) => [e.pointX, e.pointY, e.pointZ]),
      ),
    )
  }, [takeOffRefPoint, airpointsConfig])

  const areaFmt = useMemo(() => {
    if (!polygon || polygon.length < 3) {
      return '0 m²'
    }
    const plg = [...polygon]
    if (plg[0] != plg[plg.length - 1]) {
      plg.push(plg[0])
    }
    const area = turf.area(turf.polygon([plg]))
    if (area < 1e5) {
      return `${area.toFixed(1)} m²`
    }
    return `${(area / 1e6).toFixed(1)} km²`
  }, [polygon])

  /** 飞行时间 */
  const flyTimeFmt = useMemo(() => {
    const flyTime = totalDistance / speed
    if (flyTime < 60) {
      return '< 1 min'
    }
    return `${(flyTime / 60).toFixed(0)} min`
  }, [totalDistance, speed])

  const distanceFmt = useMemo(() => {
    if (totalDistance < 1000) {
      return `${totalDistance.toFixed(0)} m`
    }
    return `${(totalDistance / 1000).toFixed(1)} km`
  }, [totalDistance])

  return (
    <ul className="card-border flex p-3 px-1 text-xs text-center bg-[#1c2630] divide-x divide-ground-5">
      <li className="grow">
        <p>{t('wayline.info.length.title')}</p>
        <p className="mt-1 text-white text-sm">{distanceFmt}</p>
      </li>
      <li className="grow">
        <p>{t('wayline.info.time.title')}</p>
        <p className="mt-1 text-white text-sm">{flyTimeFmt}</p>
      </li>
      <li className="grow">
        <p>{t('wayline.info.area.title')}</p>
        <p className="mt-1 text-white text-sm">{areaFmt}</p>
      </li>
    </ul>
  )
})

InfoCard.displayName = 'AirlineInfoCard'

export default InfoCard
