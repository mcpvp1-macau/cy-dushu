import IconFlightArea from '@/assets/icons/jsx/IconFlightArea'
import IconButton from '@/components/ui/button/IconButton'
import AreaDetectModal from '@/components/AreaDetectModal'
import { getEventDetail } from '@/service/modules/events'

type PropsType = {
  actionId: number
  eventId: string
}

const AddEventResolveTask: FC<PropsType> = memo(({ actionId, eventId }) => {
  const [open, setOpen] = useState(false)

  const { data: event } = useQuery({
    queryKey: ['event-detail', eventId],
    queryFn: () => getEventDetail(eventId),
    select: (resp) => resp.data,
  })

  const center = useMemo(() => {
    if (!event?.longitude || !event?.latitude) {
      return null
    }
    return { lng: event.longitude, lat: event.latitude }
  }, [event])

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <IconButton
        disabled={!event}
        toolTipProps={{ title: '区域侦查' }}
        onClick={() => setOpen(true)}
      >
        <IconFlightArea />
      </IconButton>

      <AreaDetectModal
        open={open}
        onClose={() => setOpen(false)}
        center={center}
        actionId={actionId}
      />
    </div>
  )
})

AddEventResolveTask.displayName = 'AddEventResolveTask'

export default AddEventResolveTask
