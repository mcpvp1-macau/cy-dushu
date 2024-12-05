import { useShallow } from 'zustand/react/shallow'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { getSpaceDistance } from '@/utils/geo-math'
import { isNil } from 'lodash'

const useCalcPointFlyInfo = () => {
  const displayMode = useUavControlRoomStore((s) => s.state.displayMode)

  const { tartgetLat, tartgetLng, targetHeight } = useMemo(() => {
    const splits = displayMode?.split('￥') ?? []
    if (splits?.length < 3) {
      return {
        tartgetLng: 0,
        tartgetLat: 0,
      }
    }
    const [, lng, lat, h] = splits
    return {
      tartgetLng: parseFloat(lng),
      tartgetLat: parseFloat(lat),
      targetHeight: parseFloat(h),
    }
  }, [displayMode])

  const { lng, lat, speed } = useUavControlRoomStore(
    useShallow((s) => ({
      lng: s.state.longitude,
      lat: s.state.latitude,
      speed: s.state.horizontalSpeed,
    })),
  )

  const distance = useMemo(() => {
    if (!lng || !lat || !tartgetLng || !tartgetLat) {
      return 0
    }
    return getSpaceDistance([
      [lng, lat],
      [tartgetLng, tartgetLat],
    ])
  }, [lng, lat, tartgetLng, tartgetLat])

  const timeFormat = useMemo(() => {
    if (isNil(speed) || speed < 1e-1) {
      return '准备中'
    }
    if (distance < 20) {
      return '即将到达'
    }
    const time = distance / (speed ?? 1)
    if (time < 60) {
      return `${time.toFixed(1)} s`
    }
    return `${(time / 60).toFixed(1)} min`
  }, [distance, speed])

  return {
    tartgetLng,
    tartgetLat,
    targetHeight,
    distance,
    timeFormat,
  }
}

export default useCalcPointFlyInfo
