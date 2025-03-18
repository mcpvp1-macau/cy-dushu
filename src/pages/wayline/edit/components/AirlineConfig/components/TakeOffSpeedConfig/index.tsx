import { memo, type FC } from 'react'
import HNumber from '../../../HNumber'
import XCard from '@/components/ui/XCard'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'

type PropsType = unknown

const TakeOffSpeedConfig: FC<PropsType> = () => {
  const globalTransitionalSpeed = useAirlineConfigStore(
    (s) => s.airlineConfig.globalTransitionalSpeed,
  )
  const setAirlineConfig = useAirlineConfigStore((s) => s.updateAirlineConfig)

  return (
    <XCard title="起飞速度">
      <div style={{ marginTop: '12px' }}>
        <HNumber
          value={globalTransitionalSpeed}
          unit="m/s"
          min={1}
          max={6}
          onChange={(e) => {
            setAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              globalTransitionalSpeed: Math.max(e, 0),
            })
          }}
        />
      </div>
    </XCard>
  )
}

const memorizedCpn = memo(TakeOffSpeedConfig)
memorizedCpn.displayName = 'TakeOffSpeedConfig'

export default memorizedCpn
