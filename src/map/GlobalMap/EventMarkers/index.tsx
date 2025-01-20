import useEventStore, { useEventData } from '@/store/event/useEvent.store'
import EventMarker from './EventMarker'
import { BillboardCollection, LabelCollection } from 'resium'

const EventMarkers: React.FC = () => {
  const allEvents = useEventStore((s) => s.allEvents)
  useEventData();
  return (
    <>
      <BillboardCollection>
        <LabelCollection>
          {allEvents.map((item) => (
            <EventMarker data={item} key={item.eventId} />
          ))}
        </LabelCollection>
      </BillboardCollection>
    </>
  )
}

export default EventMarkers
