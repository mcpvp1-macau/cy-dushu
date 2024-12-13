import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import HNumber from '../../edit/components/HNumber'

type PropsType = unknown

/** 速度设置 */
const SpeedConfig: FC<PropsType> = memo(() => {
  const speed = useAreaWaylineStore((s) => s.airlineConfig.speed)
  const setAirlineConfig = useAreaWaylineStore((s) => s.updateAirlineConfig)

  return (
    <XCard title="航线速度">
      <HNumber
        className="mt-3"
        value={speed}
        unit="m"
        max={500}
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
