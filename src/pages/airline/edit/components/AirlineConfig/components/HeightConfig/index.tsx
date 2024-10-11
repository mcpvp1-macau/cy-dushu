import { memo, type FC } from 'react'
import HNumber from '../../../HNumber'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'

type PropsType = unknown

/** 航线高度设置 */
const AirlineHeightConfig: FC<PropsType> = () => {
  const height = useAirlineConfigStore((s) => s.airlineConfig.height)
  const setAirlineConfig = useAirlineConfigStore((s) => s.updateAirlineConfig)

  return (
    <XCard title="航线相对高度模式">
      {/* <Radio.Group
          style={{ width: '100%' }}
          options={['绝对高度', '相对起飞点高度', '相对地面高度']}
          optionType="button"
          buttonStyle="solid"
          defaultValue={'绝对高度'}
        /> */}
      <div style={{ marginTop: '12px' }}>
        <HNumber
          negatives={[-100, -10]}
          positives={[10, 100]}
          value={height}
          unit="m"
          max={500}
          onChange={(e) => {
            setAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              height: Math.max(e, 0),
              takeOffSecurityHeight: Math.max(e, 0),
            })
          }}
        />
      </div>
    </XCard>
  )
}

/** 航线高度设置 */
const memorizedCpn = memo(AirlineHeightConfig)
memorizedCpn.displayName = 'AirlineHeightConfig'

export default memorizedCpn
