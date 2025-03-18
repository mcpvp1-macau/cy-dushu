import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import HNumber from '../../edit/components/HNumber'

type PropsType = unknown

/** 速度设置 */
const SpeedConfig: FC<PropsType> = memo(() => {
  const speed = useAreaWaylineStore((s) => s.airlineConfig.speed)
  const setAirlineConfig = useAreaWaylineStore((s) => s.updateAirlineConfig)

  const { t } = useTranslation()

  return (
    <XCard title={t('wayline.waylineConfig.speed.title')}>
      <HNumber
        className="mt-3"
        value={speed}
        unit="m"
        min={5}
        max={15}
        onChange={(e) => {
          setAirlineConfig({
            speed: Math.max(e, 0),
          })
        }}
      />
    </XCard>
  )
})

SpeedConfig.displayName = 'SpeedConfig'

export default SpeedConfig
