import CloseableHeader from './components/CloseableHeader'
import { algorithmIconMap } from '@/components/device/algorithm/AlgorithmListItem'
import EventDetail from '../events/components/EventDetail'
import useRightMode from '@/store/layout/useRightMode.store'
import { getEventDetail } from '@/service/modules/events'
import { QuestionCircleFilled } from '@ant-design/icons'
import { bigFlyEmitter } from '@/map/GlobalMap/BigFlyListener'
import AppSpin from '@/components/AppSpin'

type PropsType = unknown

const RightEventDetail: FC<PropsType> = memo(() => {
  const eventId = useRightMode((s) => s.detailId)

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

  const Icon =
    algorithmIconMap[data?.eventType ?? 'unknown'] ?? QuestionCircleFilled

  // big fly
  useEffect(() => {
    if (!data) {
      return
    }
    if (data.longitude && data.latitude) {
      bigFlyEmitter.emit('bigFly', {
        lng: data.longitude,
        lat: data.latitude,
      })
    }
  }, [data])

  return (
    <div className="w-[350px] backdrop-blur">
      <CloseableHeader>
        <div className="flex gap-2 items-center">
          <Icon />
          <h6 className="text-white text-base">{data?.eventName}</h6>
        </div>
      </CloseableHeader>
      <div className="px-3 pb-3">
        {!isLoading && data ? (
          <EventDetail data={data} useCol useGo />
        ) : (
          <AppSpin />
        )}
      </div>
    </div>
  )
})

RightEventDetail.displayName = 'RightEventDetail'

export default RightEventDetail
