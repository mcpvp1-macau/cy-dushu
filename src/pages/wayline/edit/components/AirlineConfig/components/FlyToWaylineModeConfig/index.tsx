import { Radio } from 'antd'
import { memo, type FC } from 'react'
import HNumber from '../../../HNumber'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'

type PropsType = unknown

/** 无人机爬升模式设置 */
const FlyToWaylineModeConfig: FC<PropsType> = () => {
  const flyToWaylineMode = useAirlineConfigStore(
    (s) => s.airlineConfig.flyToWaylineMode,
  )
  const takeOffSecurityHeight = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffSecurityHeight,
  )
  const setAirlineConfig = useAirlineConfigStore((s) => s.updateAirlineConfig)

  /** 爬升模式 */
  const handleFlyToWaylineMode = (x: string) => {
    setAirlineConfig({
      ...useAirlineConfigStore.getState().airlineConfig,
      flyToWaylineMode: x,
    })
  }

  return (
    <XCard title="无人机爬升模式">
      <Radio.Group
        style={{ width: '100%' }}
        options={[
          {
            label: '垂直爬升',
            value: 'safely',
          },
          {
            label: '倾斜爬升',
            value: 'pointToPoint',
          },
        ]}
        optionType="button"
        buttonStyle="solid"
        value={flyToWaylineMode}
        onChange={(e) => handleFlyToWaylineMode(e.target.value)}
      />
      <div style={{ marginTop: '12px' }}>
        <HNumber
          negatives={[-100, -10]}
          positives={[10, 100]}
          value={takeOffSecurityHeight}
          unit="m"
          max={500}
          onChange={(e) => {
            setAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              takeOffSecurityHeight: Math.max(e, 0),
            })
          }}
        />
      </div>
    </XCard>
  )
}

/** 无人机爬升模式设置 */
const memorizedCpn = memo(FlyToWaylineModeConfig)
memorizedCpn.displayName = 'FlyToWaylineModeConfig'

export default memorizedCpn
