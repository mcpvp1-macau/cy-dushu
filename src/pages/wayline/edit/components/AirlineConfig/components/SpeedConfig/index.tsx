import { memo, type FC } from 'react'
import HNumber from '../../../HNumber'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'

type PropsType = unknown

/** 航线速度设置 */
const AirlineSpeedConfig: FC<PropsType> = () => {
  const speed = useAirlineConfigStore((s) => Number(s.airlineConfig.speed))
  const setAirlineConfig = useAirlineConfigStore((s) => s.updateAirlineConfig)
  const { t } = useTranslation()

  return (
    <XCard title={t('wayline.waylineConfig.speed.title')}>
      <div style={{ marginTop: '12px' }}>
        <HNumber
          value={speed}
          unit="m/s"
          min={1}
          max={15}
          onChange={(e) => {
            setAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              speed: Math.max(e, 0),
            })
          }}
        />
      </div>
    </XCard>
  )
}

/** 航线速度设置 */
const memorizedCpn = memo(AirlineSpeedConfig)
memorizedCpn.displayName = 'AirlineSpeedConfig'

export default memorizedCpn
