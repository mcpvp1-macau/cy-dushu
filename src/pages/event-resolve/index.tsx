import IconBack from '@/assets/icons/jsx/IconBack'
import AppSpin from '@/components/AppSpin'
import CollapsedPage from '@/components/CollapsedPage'
import IconButton from '@/components/ui/button/IconButton'
import { getEventDetail } from '@/service/modules/events'
import EventDetail from '../events/components/EventDetail'
import { ScrollArea } from '@/components/ui/scroll-area'
import AddAction from '../situation/action/components/AddAction'
import { Button } from 'antd'
import { Link } from 'react-router-dom'

type PropsType = unknown

const EventResolvePage: FC<PropsType> = memo(() => {
  const { eventId } = useParams()

  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['eventDetail', eventId],
      queryFn: () => getEventDetail(eventId!),
      enabled: !!eventId,
      select: (d) => d.data,
    },
    queryClient,
  )

  const navigate = useNavigate()

  return (
    <CollapsedPage>
      {isLoading || !data ? (
        <AppSpin />
      ) : (
        <div className="h-full flex flex-col overflow-hidden">
          <div
            className={clsx(
              'w-full flex items-center justify-between gap-2 overflow-hidden px-3',
              'border-b border-solid border-gray-700',
            )}
          >
            <div>
              <IconButton
                tippyProps={{ content: t('common.back') }}
                onClick={() => navigate(-1)}
              >
                <IconBack />
              </IconButton>
            </div>
            <div className="flex-1 flex flex-col justify-center h-[32px] overflow-hidden">
              <h3 className="text-white text-base truncate">
                {data.eventName || '-'}
              </h3>
            </div>
          </div>
          <ScrollArea className="p-3 flex-1">
            {data && <EventDetail data={data} useCol useGo />}
          </ScrollArea>
          <div className="flex justify-center p-3">
            {data.actionId ? (
              <Link to={`/action/${data.actionId}`}>
                <Button className="w-28" type="primary">
                  {t('action.detail.title')}
                </Button>
              </Link>
            ) : (
              <AddAction
                extra={{
                  eventId: eventId ?? undefined,
                }}
              />
            )}
          </div>
        </div>
      )}
    </CollapsedPage>
  )
})

EventResolvePage.displayName = 'EventResolvePage'

export default EventResolvePage
