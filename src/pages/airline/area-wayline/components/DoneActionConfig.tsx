import Select from '@/components/AntdOverride/Select'
import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'

type PropsType = unknown

const finishAction = {
  label: '航线结束动作',
  key: 'finishAction',
  options: [
    {
      label: '自动返航',
      value: 'GO_HOME',
    },
    {
      label: '退出航线模式',
      value: 'NO_ACTION',
    },
  ],
}

/* 航线结束动作 */
const FinishActionConfig: FC<PropsType> = memo(() => {
  const value = useAreaWaylineStore((s) => s.airlineConfig.finishAction)
  const update = useAreaWaylineStore((s) => s.updateAirlineConfig)

  return (
    <XCard title="航线结束动作">
      <Select
        className="w-full mt-3"
        options={finishAction.options}
        value={value}
        onChange={(v) =>
          update({
            finishAction: v,
          })
        }
      />
    </XCard>
  )
})

FinishActionConfig.displayName = 'DoneActionConfig'

export default FinishActionConfig
