import { useShallow } from 'zustand/react/shallow'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'
import { getSpaceDistance } from '@/utils/geo-math'
import { isNil } from 'lodash'

const useCalcPointSailInfo = () => {
  const displayMode = useUsvControlRoomStore((s) => s.state.displayMode)
  const pointSailTarget = useUsvControlRoomStore((s) => s.pointSail.targetPosition)
  const { t } = useTranslation()

  const { targetLng, targetLat, hasTarget } = useMemo(() => {
    const splits = displayMode?.split('￥') ?? []
    if (splits?.length >= 3) {
      const [, lng, lat] = splits
      return {
        targetLng: parseFloat(lng),
        targetLat: parseFloat(lat),
        hasTarget: true,
      }
    }

    // 业务规则：未解析到指点航行坐标时，优先复用用户当前的指点目标
    if (pointSailTarget?.length === 2) {
      return {
        targetLng: pointSailTarget[0],
        targetLat: pointSailTarget[1],
        hasTarget: true,
      }
    }

    return {
      targetLng: 0,
      targetLat: 0,
      hasTarget: false,
    }
  }, [displayMode, pointSailTarget])

  const { lng, lat, speed } = useUsvControlRoomStore(
    useShallow((s) => ({
      lng: s.state.longitude,
      lat: s.state.latitude,
      speed: s.state.speed,
    })),
  )

  const distance = useMemo(() => {
    if (!hasTarget || !lng || !lat || !targetLng || !targetLat) {
      return 0
    }

    return getSpaceDistance([
      [lng, lat],
      [targetLng, targetLat],
    ])
  }, [hasTarget, lng, lat, targetLng, targetLat])

  const timeFormat = useMemo(() => {
    if (isNil(speed) || speed < 1e-1) {
      return t('usv.pointSailForecast.time.ready', { defaultValue: '准备中' })
    }
    if (distance < 20) {
      return t('usv.pointSailForecast.time.arriving', { defaultValue: '即将到达' })
    }
    const time = distance / (speed ?? 1)
    if (time < 60) {
      return `${time.toFixed(1)} s`
    }
    return `${(time / 60).toFixed(1)} min`
  }, [distance, speed, t])

  return {
    targetLng,
    targetLat,
    distance,
    timeFormat,
    hasTarget,
  }
}

export default useCalcPointSailInfo
