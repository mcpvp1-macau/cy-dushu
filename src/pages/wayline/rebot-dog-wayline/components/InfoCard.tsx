import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'
import { getSpaceDistance } from '@/utils/other/utils'

type PropsType = unknown

const RebotDogInfoCard: FC<PropsType> = memo(() => {
  const waypointsConfig = useRebotDogWaylineStore((s) => s.waypointsConfig)

  const speed = useRebotDogWaylineStore((s) => s.waylineConfig.speed)

  const { t } = useTranslation()

  /** 航线距离 */
  const totalDistance = useMemo(() => {
    return getSpaceDistance(
      waypointsConfig.map((e) => [e.pointX, e.pointY, e.pointZ]),
    )
  }, [waypointsConfig])

  /** 航线总照片数 */
  const totalPhotos = useMemo(() => {
    let ans = 0
    waypointsConfig.forEach((e) => {
      e.actions?.forEach((a: any) => {
        if (a?.type === 'GET_PICTURE') {
          ans += 1
        }
      })
    })
    return ans
  }, [waypointsConfig])

  const hoverTimeTotal = useMemo(
    () =>
      waypointsConfig.reduce((prev, e) => {
        e.actions?.forEach((a: any) => {
          if (a?.type === 'HOVER') {
            prev += Number(a.config.hoverTime)
          }
        })
        return prev
      }, 0),
    waypointsConfig,
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
        <p>{t('wayline.info.pointCnt.title')}</p>
        <p className="mt-1 text-white text-sm">{waypointsConfig.length}</p>
      </li>
      <li className="grow">
        <p>{t('wayline.info.photoCnt.title')}</p>
        <p className="mt-1 text-white text-sm">{totalPhotos}</p>
      </li>
    </ul>
  )
})

RebotDogInfoCard.displayName = 'AirlineInfoCard'

export default RebotDogInfoCard
