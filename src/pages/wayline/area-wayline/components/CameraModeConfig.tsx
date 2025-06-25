import Select from '@/components/AntdOverride/Select'
import XCard from '@/components/ui/XCard'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import { InputNumber } from 'antd'

type PropsType = unknown

const CameraModeConfig: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const actionTriggerType = useAreaWaylineStore(
    (s) => s.airlineConfig.actionTriggerType,
  )

  const actionTriggerParam = useAreaWaylineStore(
    (s) => s.airlineConfig.actionTriggerParam,
  )

  return (
    <XCard title={t('controlRoom.uav.service.cameraMode.photo.title')}>
      <div className="mt-3">
        <Select
          className="w-full"
          defaultValue="reachPoint"
          value={actionTriggerType}
          onChange={(v) => {
            const s = useAreaWaylineStore.getState()
            s.updateAirlineConfig({
              ...s.airlineConfig,
              actionTriggerType: v as any,
            })
          }}
          options={[
            { label: '到达航点时拍照', value: 'reachPoint' },
            {
              label: '等时触发',
              value: 'multipleTiming',
            },
            {
              label: '等距触发',
              value: 'multipleDistance',
            },
          ]}
        />
        {['multipleTiming', 'multipleDistance'].includes(actionTriggerType) && (
          <InputNumber
            className="w-full mt-3"
            value={actionTriggerParam}
            min={0}
            onChange={(v) => {
              const s = useAreaWaylineStore.getState()
              s.updateAirlineConfig({
                ...s.airlineConfig,
                actionTriggerParam: v,
              })
            }}
            suffix={actionTriggerType === 'multipleTiming' ? 's' : 'm'}
          />
        )}
      </div>
    </XCard>
  )
})

CameraModeConfig.displayName = 'CameraModeConfig'

export default CameraModeConfig
