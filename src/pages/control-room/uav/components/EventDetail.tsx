import EventDetail from '@/pages/events/components/EventDetail'
import { useUavControlRoomLayoutStore } from '../hooks/useUavControlRoomLayout.store'
import { getEventDetail } from '@/service/modules/events'
import AppSpin from '@/components/AppSpin'

type PropsType = unknown

const ControlRoomEventDetail: FC<PropsType> = memo(() => {
  const eventId = useUavControlRoomLayoutStore((s) => s.eventId)

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['getEventDetail', eventId],
      queryFn: () => getEventDetail(eventId!),
      enabled: !!eventId,
      select: (d) => d.data,
    },
    queryClient,
  )

  if (!data || isLoading) {
    return <AppSpin />
  }

  return (
    <div className="p-3">
      <EventDetail data={data} useCol />
    </div>
  )
})

ControlRoomEventDetail.displayName = 'EventDetail'

export default ControlRoomEventDetail
