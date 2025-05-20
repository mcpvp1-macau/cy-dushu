import EventDetail from '@/pages/events/components/EventDetail'
import { useUavControlRoomLayoutStore } from '../hooks/useUavControlRoomLayout.store'

type PropsType = unknown

const ControlRoomEventDetail: FC<PropsType> = memo(() => {
  const eventId = useUavControlRoomLayoutStore((s) => s.eventId)

  if (!eventId) {
    return null
  }

  return (
    <div className="p-3">
      <EventDetail eventId={eventId} useCol />
    </div>
  )
})

ControlRoomEventDetail.displayName = 'EventDetail'

export default ControlRoomEventDetail
