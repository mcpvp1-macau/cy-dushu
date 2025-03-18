import { memo, type FC } from 'react'
import HNumber from '../../../HNumber'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'

type PropsType = unknown

const GoHomeHeightConfig: FC<PropsType> = memo(() => {
  const globalRTHHeight = useAirlineConfigStore(
    (s) => s.airlineConfig.globalRTHHeight,
  )
  const setAirlineConfig = useAirlineConfigStore((s) => s.updateAirlineConfig)

  const { t } = useTranslation()

  return (
    <XCard title={t('wayline.waylineConfig.returnHeight.title')}>
      <div style={{ marginTop: '12px' }}>
        <HNumber
          negatives={[-100, -10]}
          positives={[10, 100]}
          value={globalRTHHeight}
          unit="m"
          max={500}
          onChange={(e) => {
            setAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              globalRTHHeight: Math.max(e, 0),
            })
          }}
        />
      </div>
    </XCard>
  )
})

GoHomeHeightConfig.displayName = 'GoHomeHeightConfig'
export default GoHomeHeightConfig
