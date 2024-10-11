import EditableNameHeader from '@/components/EditableNameHeader'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { memo, type FC } from 'react'

type PropsType = unknown

const AirlineHeader: FC<PropsType> = memo(() => {
  const taskName = useAirlineConfigStore((s) => s.airlineTemplateInfo.taskName)
  const updateAirlineTemplateInfo = useAirlineConfigStore(
    (s) => s.updateAirlineTemplateInfo,
  )
  const navigate = useNavigate()

  return (
    <div>
      <EditableNameHeader
        className="px-3"
        value={taskName ?? '-'}
        onFinish={(v) => {
          updateAirlineTemplateInfo({
            ...useAirlineConfigStore.getState().airlineTemplateInfo,
            taskName: v,
          })
        }}
        onBackClick={() => navigate(-1)}
      />
    </div>
  )
})

AirlineHeader.displayName = 'AirlineHeader'

export default AirlineHeader
