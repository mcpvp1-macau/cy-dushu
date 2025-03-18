import XCard from '@/components/ui/XCard'
import HNumber from '../../edit/components/HNumber'
import useSwarmWaylineStore from '@/store/uav/uav-swarm-wayline/useSwarmWayline.store'

type PropsType = unknown

/** 高度设置 */
const HeightConfig: FC<PropsType> = memo(() => {
  const height = useSwarmWaylineStore((s) => s.airlineConfig.height)
  const setAirlineConfig = useSwarmWaylineStore((s) => s.updateAirlineConfig)
  const { t } = useTranslation()

  return (
    <XCard title={t('wayline.waylineConfig.atl.title')}>
      <HNumber
        className="mt-3"
        negatives={[-100, -10]}
        positives={[10, 100]}
        value={height}
        unit="m"
        max={500}
        onChange={(e) => {
          setAirlineConfig({
            height: Math.max(e, 0),
            takeOffSecurityHeight: Math.max(e, 0),
          })
        }}
      />
    </XCard>
  )
})

HeightConfig.displayName = 'HeightConfig'

export default HeightConfig
