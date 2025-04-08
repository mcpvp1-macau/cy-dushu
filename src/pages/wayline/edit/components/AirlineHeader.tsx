import EditableNameHeader from '@/components/EditableNameHeader'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'

type PropsType = unknown

const AirlineHeader: FC<PropsType> = memo(() => {
  const taskName = useAirlineConfigStore((s) => s.airlineTemplateInfo.taskName)
  const updateAirlineTemplateInfo = useAirlineConfigStore(
    (s) => s.updateAirlineTemplateInfo,
  )
  const navigate = useNavigate()

  const { t } = useTranslation()

  return (
    <EditableNameHeader
      className="px-3"
      value={taskName ?? '-'}
      onFinish={(v) => {
        updateAirlineTemplateInfo({
          ...useAirlineConfigStore.getState().airlineTemplateInfo,
          taskName: v,
        })
      }}
      backConfirm={{
        content: t('wayline.backConfirm'),
        placement: 'bottomLeft',
      }}
      onBackClick={() => navigate(-1)}
    />
  )
})

AirlineHeader.displayName = 'AirlineHeader'

export default AirlineHeader
