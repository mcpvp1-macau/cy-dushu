import PositionTooltip from '@/components/map/PostionTooltip'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { getSpaceDistance } from '@/utils/geo-math'
import { memo, type FC } from 'react'
import { useShallow } from 'zustand/react/shallow'
import UavPointFlyTarget from './Target'

type PropsType = unknown

/** 指点飞行预测 */
const PointFlyForecast: FC<PropsType> = memo(() => {
  const displayMode = useUavControlRoomStore((s) => s.state.displayMode)

  const { tartgetLat, tartgetLng } = useMemo(() => {
    const splits = displayMode?.split('￥') ?? []
    if (splits?.length < 3) {
      return {
        tartgetLng: 0,
        tartgetLat: 0,
      }
    }
    const [, lng, lat] = splits
    return {
      tartgetLng: parseFloat(lng),
      tartgetLat: parseFloat(lat),
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
    if (distance < 20) {
      return '即将到达'
    }
    const time = distance / (speed ?? 1)
    if (time < 60) {
      return `${time.toFixed(1)} s`
    }
    return `${(time / 60).toFixed(1)} min`
  }, [distance, speed])

  return (
    <>
      <PositionTooltip position={[tartgetLng, tartgetLat]} offset={[0, 30]}>
        <div className="flex flex-col gap-1 text-fore p-1 text-xs">
          <p className="flex justify-between gap-1">
            任务距离:
            <span>
              {distance > 1000
                ? `${(distance / 1000).toFixed(1)} km`
                : `${distance.toFixed(1)} m`}
            </span>
          </p>
          <p className="flex justify-between gap-1">
            预计时间:
            <span>{timeFormat}</span>
          </p>
        </div>
      </PositionTooltip>
      <UavPointFlyTarget position={[tartgetLng, tartgetLat]} />
    </>
  )
})

PointFlyForecast.displayName = 'PointFlyForecast'

export default PointFlyForecast
