import PositionTooltip from '@/components/map/PositionTooltip'
import UsvPointSailTarget from './Target'
import useCalcPointSailInfo from './hooks/useCalcPointSailInfo'

/** 指点航行预测 */
const UsvPointSailForecast: FC = memo(() => {
  const { targetLng, targetLat, distance, timeFormat, hasTarget } =
    useCalcPointSailInfo()
  const { t } = useTranslation()

  if (!hasTarget) {
    return null
  }

  return (
    <>
      <PositionTooltip position={[targetLng, targetLat, 0]} offset={[0, 30]}>
        <div className="p-2 flex flex-col gap-1 text-fore text-xs">
          <p className="flex justify-between gap-1">
            {t('usv.pointSailForecast.distance.title', { defaultValue: '距离' })}:
            <span>
              {distance > 1000
                ? `${(distance / 1000).toFixed(1)} km`
                : `${distance.toFixed(1)} m`}
            </span>
          </p>
          <p className="flex justify-between gap-1">
            {t('usv.pointSailForecast.time.title', { defaultValue: '预计时间' })}:
            <span>{timeFormat}</span>
          </p>
        </div>
      </PositionTooltip>
      <UsvPointSailTarget position={[targetLng, targetLat]} />
    </>
  )
})

UsvPointSailForecast.displayName = 'UsvPointSailForecast'

export default UsvPointSailForecast
