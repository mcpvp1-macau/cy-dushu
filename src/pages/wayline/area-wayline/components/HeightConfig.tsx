import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import HNumber from '../../edit/components/HNumber'

type PropsType = unknown

/** 高度设置 */
const HeightConfig: FC<PropsType> = memo(() => {
  const height = useAreaWaylineStore((s) => s.airlineConfig.height)
  const setAirlineConfig = useAreaWaylineStore((s) => s.updateAirlineConfig)
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
