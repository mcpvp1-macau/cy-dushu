import { useCesium } from 'resium'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import PositionTooltip from '@/components/map/PostionTooltip'
import { getSpaceDistance } from '@/utils/geo-math'
import { isNil } from 'lodash'

type PropsType = {
  positions: { pointX: number; pointY: number; pointZ: number }[]
}

/** 预报下一个航点的时间和距离 */
const Forecats: FC<PropsType> = memo(({ positions }) => {
  const { t } = useTranslation()
  const waypointIndex = useUavControlRoomStore((s) => s.state.waypointIndex)
  const { viewer } = useCesium()

  const speed = useUavControlRoomStore((s) => s.state.horizontalSpeed) ?? 1
  const {
    uavLng = 0,
    uavLlat = 0,
    uavHeight = 0,
  } = useUavControlRoomStore((s) => ({
    uavLng: s.state.longitude,
    uavLlat: s.state.latitude,
    uavHeight: s.state.altitude,
  }))

  const [boardInfo, setBoardInfo] = useState({
    lng: 0,
    lat: 0,
    alt: 0,
    remainDistance: 0,
  })

  useEffect(() => {
    if (
      !viewer?.scene ||
      waypointIndex === undefined ||
      waypointIndex >= positions.length
    ) {
      return
    }
    const targetPoint = positions[waypointIndex]

    const remainDistance = getSpaceDistance([
      [uavLng, uavLlat, uavHeight],
      [targetPoint.pointX, targetPoint.pointY, targetPoint.pointZ],
    ])

    setBoardInfo({
      lng: targetPoint.pointX,
      lat: targetPoint.pointY,
      alt: targetPoint.pointZ,
      remainDistance,
    })

    return () => {}
  }, [waypointIndex, positions, uavLng, uavLlat, uavHeight])

  const timeFormat = useMemo(() => {
    if (isNil(speed) || speed < 1e-1) {
      return t('common.preparing')
    }
    if (boardInfo.remainDistance < 20) {
      return t('common.arriving')
    }
    const time = boardInfo.remainDistance / (speed ?? 1)
    if (time < 60) {
      return `${time.toFixed(1)} s`
    }
    return `${(time / 60).toFixed(1)} min`
  }, [boardInfo.remainDistance, speed, t])

  return (
    <>
      {viewer &&
        boardInfo.remainDistance >= 1 &&
        (waypointIndex || 0) < positions.length && (
          <PositionTooltip
            position={[boardInfo.lng, boardInfo.lat]}
            alwayInViewport
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                wordWrap: 'normal',
                whiteSpace: 'nowrap',
                textAlign: 'left',
              }}
            >
              <div>
                {t('forecast.remainDistance.title')}:{' '}
                {boardInfo.remainDistance.toFixed(0)}m
              </div>
              <div>
                {t('forecast.remainTime.title')}: {timeFormat}
              </div>
            </div>
          </PositionTooltip>
        )}
    </>
  )
})

Forecats.displayName = 'Forecats'

export default Forecats
