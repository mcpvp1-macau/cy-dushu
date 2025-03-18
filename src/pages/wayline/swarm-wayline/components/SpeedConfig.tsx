import XCard from '@/components/ui/XCard'
import HNumber from '../../edit/components/HNumber'
import useSwarmWaylineStore from '@/store/uav/uav-swarm-wayline/useSwarmWayline.store'

type PropsType = unknown

/** 速度设置 */
const SpeedConfig: FC<PropsType> = memo(() => {
  const speed = useSwarmWaylineStore((s) => s.airlineConfig.speed)
  const setAirlineConfig = useSwarmWaylineStore((s) => s.updateAirlineConfig)

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
