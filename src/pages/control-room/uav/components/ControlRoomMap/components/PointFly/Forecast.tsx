import PositionTooltip from '@/components/map/PostionTooltip'
import UavPointFlyTarget from './Target'
import useCalcPointFlyInfo from './hooks/useCalcPointFlyInfo'

type PropsType = {
  displayTarget?: boolean
}

/** 指点飞行预测 */
const PointFlyForecast: FC<PropsType> = memo(({ displayTarget = true }) => {
  const { tartgetLng, tartgetLat, targetHeight, distance, timeFormat } =
    useCalcPointFlyInfo()
  const { t } = useTranslation()

  return (
    <>
      <PositionTooltip
        position={[tartgetLng, tartgetLat, targetHeight ?? 0]}
        offset={[0, 30]}
      >
        <div className="flex flex-col gap-1 text-fore p-1 text-xs">
          <p className="flex justify-between gap-1">
            {t('controlRoom.uav.pointFlyForecast.distance.title')}:
            <span>
              {distance > 1000
                ? `${(distance / 1000).toFixed(1)} km`
                : `${distance.toFixed(1)} m`}
            </span>
          </p>
          <p className="flex justify-between gap-1">
            {t('controlRoom.uav.pointFlyForecast.time.title')}:
            <span>{timeFormat}</span>
          </p>
        </div>
      </PositionTooltip>
      {displayTarget && (
        <UavPointFlyTarget
          position={[tartgetLng, tartgetLat, targetHeight ?? 0]}
        />
      )}
    </>
  )
})

PointFlyForecast.displayName = 'PointFlyForecast'

export default PointFlyForecast
