import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import HNumber from '../../edit/components/HNumber'

type PropsType = unknown

/** 高度设置 */
const GoHomeHeightConfig: FC<PropsType> = memo(() => {
  const height = useAreaWaylineStore((s) => s.airlineConfig.globalRTHHeight)
  const setAirlineConfig = useAreaWaylineStore((s) => s.updateAirlineConfig)

  return (
    <XCard title="航线返航高度">
      <HNumber
        className="mt-3"
        negatives={[-100, -10]}
        positives={[10, 100]}
        value={height}
        unit="m"
        max={500}
        onChange={(e) => {
          setAirlineConfig({
            globalRTHHeight: Math.max(e, 0),
          })
        }}
      />
    </XCard>
  )
})

GoHomeHeightConfig.displayName = 'GoHomeHeightConfig'

export default GoHomeHeightConfig
