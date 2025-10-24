import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import { Switch } from 'antd'

type PropsType = unknown

const AdvancedConfig: FC<PropsType> = memo(() => {
  // 是否开启绕开禁飞区
  const enableAvoidNoFlyArea = useAreaWaylineStore(
    (s) => s.airlineConfig.enableAvoidNoFlyArea,
  )

  return (
    <XCard title="高级设置" collapsible>
      <div className="flex justify-between mt-2">
        避开禁飞区{' '}
        <Switch
          size="small"
          value={enableAvoidNoFlyArea}
          onChange={(value) => {
            useAreaWaylineStore.getState().updateAirlineConfig({
              ...useAreaWaylineStore.getState().airlineConfig,
              enableAvoidNoFlyArea: value,
            })
          }}
        />
      </div>
    </XCard>
  )

  return null
})

AdvancedConfig.displayName = 'AdvancedConfig'

export default AdvancedConfig
