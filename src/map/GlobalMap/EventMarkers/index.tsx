import useEventStore, { useEventData } from '@/store/event/useEvent.store'
import EventMarker from './EventMarker'
import { BillboardCollection, LabelCollection } from 'resium'
import useWarnningSettingStore from '@/store/setting/useWarnningSetting.store'

const EventMarkers: React.FC = () => {
  const allEvents = useEventStore((s) => s.allEvents)
  const isAddMap = useWarnningSettingStore((s) => s.isAddMap)
  useEventData();

  if(!isAddMap) return null
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
