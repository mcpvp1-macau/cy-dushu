import Select from '@/components/AntdOverride/Select'
import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'

type PropsType = unknown

/* 航线结束动作 */
const FinishActionConfig: FC<PropsType> = memo(() => {
  const value = useAreaWaylineStore((s) => s.airlineConfig.finishAction)
  const update = useAreaWaylineStore((s) => s.updateAirlineConfig)

  const { t } = useTranslation()

  const options = useMemo(
    () => [
      {
        label: t('wayline.advancedSetting.finishAction.GO_HOME.title'),
        value: 'GO_HOME',
      },
      {
        label: t('wayline.advancedSetting.finishAction.NO_ACTION.title'),
        value: 'NO_ACTION',
      },
    ],
    [t],
  )

  return (
    <XCard title={t('wayline.advancedSetting.finishAction.title')}>
      <Select
        className="w-full mt-3"
        options={options}
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
