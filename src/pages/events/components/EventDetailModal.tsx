import XModal from '@/components/XModal'
import { Button } from 'antd'
import EventDetail from './EventDetail'

type PropsType = {
  data: API_EVENTS.domain.Event
}

const EventDetailModal: FC<PropsType> = memo(({ data }) => {
  const [open, { setTrue, setFalse }] = useBoolean()

  return (
    <>
      <Button type="link" onClick={setTrue}>
        详情
      </Button>
      {open && (
        <XModal
          title={`${data.eventName}(${data.id})`}
          centered
          noPadding
          open={open}
          onClose={setFalse}
          footer={false}
        >
          <div className="p-3">
            <EventDetail eventId={data.eventId} />
          </div>
        </XModal>
      )}
    </>
  )
})

EventDetailModal.displayName = 'EventDetailModal'

export default EventDetailModal
