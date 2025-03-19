import EditableNameHeader from '@/components/EditableNameHeader'
import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'

type PropsType = unknown

const Header: FC<PropsType> = memo(() => {
  const taskName = useRebotDogWaylineStore(
    (s) => s.waylineTemplateInfo.taskName,
  )
  const updateAirlineTemplateInfo = useRebotDogWaylineStore(
    (s) => s.updateWaylineTemplateInfo,
  )
  const navigate = useNavigate()

  return (
    <EditableNameHeader
      className="px-3"
      value={taskName ?? '-'}
      onFinish={(v) => {
        updateAirlineTemplateInfo({
          ...useRebotDogWaylineStore.getState().waylineTemplateInfo,
          taskName: v,
        })
      }}
      onBackClick={() => navigate(-1)}
    />
  )
})

Header.displayName = 'Header'

export default Header
