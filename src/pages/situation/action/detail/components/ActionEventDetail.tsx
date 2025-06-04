import AppSpin from '@/components/AppSpin'
import EventDetail from '@/pages/events/components/EventDetail'
import { getEventDetail } from '@/service/modules/events'

type PropsType = {
  eventId: string
}

const ActionEventDetail: FC<PropsType> = memo(({ eventId }) => {
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

  return (
    <div className="p-3">
      {!data || isLoading ? (
        <AppSpin />
      ) : (
        <EventDetail data={data} useCol useGo />
      )}
    </div>
  )
})

ActionEventDetail.displayName = 'ActionEventDetail'

export default ActionEventDetail
