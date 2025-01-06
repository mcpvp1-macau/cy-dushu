import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { getSpaceDistance } from '@/utils/other/utils'

type PropsType = unknown

const AirlineInfoCard: FC<PropsType> = memo(() => {
  const takeOffRefPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const airpointsConfig = useAirlineConfigStore((s) => s.airpointsConfig)

  const speed = useAirlineConfigStore((s) => s.airlineConfig.speed)

  const { t } = useTranslation()

  /** 航线距离 */
  const totalDistance = useMemo(() => {
    if (!takeOffRefPoint) return 0
    return getSpaceDistance(
      [takeOffRefPoint].concat(
        airpointsConfig.map((e) => [e.pointX, e.pointY, e.pointZ]),
      ),
    )
  }, [takeOffRefPoint, airpointsConfig])

  /** 航线总照片数 */
  const totalPhotos = useMemo(() => {
    let ans = 0
    airpointsConfig.forEach((e) => {
      e.actions?.forEach((a: any) => {
        if (a?.type === 'GET_PICTURE') {
          ans += 1
        }
      })
    })
    return ans
  }, [airpointsConfig])

  const hoverTimeTotal = useMemo(
    () =>
      airpointsConfig.reduce((prev, e) => {
        e.actions?.forEach((a: any) => {
          if (a?.type === 'HOVER') {
            prev += Number(a.config.hoverTime)
          }
        })
        return prev
      }, 0),
    airpointsConfig,
  )

  /** 飞行时间 */
  const flyTimeFmt = useMemo(() => {
    const flyTime = totalDistance / speed
    if (flyTime < 60) {
      return '< 1 min'
    }
    return `${((flyTime + hoverTimeTotal) / 60).toFixed(0)} min`
  }, [totalDistance, speed, hoverTimeTotal])

  const distanceFmt = useMemo(() => {
    if (totalDistance < 1000) {
      return `${totalDistance.toFixed(0)} m`
    }
    return `${(totalDistance / 1000).toFixed(1)} km`
  }, [totalDistance])

  return (
    <ul className="card-border flex p-3 px-1 text-xs text-center bg-[#1c2630] divide-x divide-ground-300">
      <li className="grow">
        <p>{t('wayline.info.length.title')}</p>
        <p className="mt-1 text-white text-sm">{distanceFmt}</p>
      </li>
      <li className="grow">
        <p>{t('wayline.info.time.title')}</p>
        <p className="mt-1 text-white text-sm">{flyTimeFmt}</p>
      </li>
      <li className="grow">
        <p>{t('wayline.info.pointCnt.title')}</p>
        <p className="mt-1 text-white text-sm">{airpointsConfig.length}</p>
      </li>
      <li className="grow">
        <p>{t('wayline.info.photoCnt.title')}</p>
        <p className="mt-1 text-white text-sm">{totalPhotos}</p>
      </li>
    </ul>
  )
})

AirlineInfoCard.displayName = 'AirlineInfoCard'

export default AirlineInfoCard
