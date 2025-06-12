import CloseableHeader from './components/CloseableHeader'
import { algorithmIconMap } from '@/components/device/algorithm/AlgorithmListItem'
import EventDetail from '../events/components/EventDetail'
import useRightMode from '@/store/layout/useRightMode.store'
import { getEventDetail } from '@/service/modules/events'
import { QuestionCircleFilled } from '@ant-design/icons'
import { bigFlyEmitter } from '@/map/GlobalMap/BigFlyListener'
import AppSpin from '@/components/AppSpin'
import useEventStore from '@/store/event/useEvent.store'

type PropsType = unknown

const RightEventDetail: FC<PropsType> = memo(() => {
  const rightEventId = useRightMode((s) => s.detailId)

  const queryClient = useQueryClient()
  const { data: queryData, isLoading } = useQuery(
    {
      queryKey: ['getEventDetail', rightEventId],
      queryFn: () => getEventDetail(rightEventId!),
      enabled: !!rightEventId,
      select: (d) => d.data,
    },
    queryClient,
  )

  const swiperData = useEventStore((s) => s.swiperEvents)
  const [swiperIndex, setSwiperIndex] = useState(-1)

  const data: API_EVENTS.domain.Event | undefined =
    swiperData[swiperIndex] ?? queryData

  // event store 中的 eventId 和 rightMode 中的 eventId 不一定是一致的
  // event store 中的 eventId 可能是切换过的
  useEffect(() => {
    setSwiperIndex(-1)
    useEventStore.getState().updateDetailEventId(rightEventId)
  }, [rightEventId])
  useEffect(() => {
    if (data?.eventId && data.eventId !== rightEventId) {
      useEventStore.getState().updateDetailEventId(data.eventId)
    }
  }, [data?.eventId, rightEventId])

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

  const handleIndexChange = (index: number) => {
    setSwiperIndex(index)
  }

  // 是否在 swiper 列表中找到对应的事件
  const foundInSwiperList = useMemo(
    () => swiperData.find((e) => e.eventId === data?.eventId),
    [swiperData, data],
  )

  return (
    <div className="w-[350px] backdrop-blur">
      <CloseableHeader>
        <div className="flex gap-2 items-center">
          <Icon />
          <h6 className="text-white text-base">
            {data?.eventName} {data?.id && `(${data.id})`}
          </h6>
        </div>
      </CloseableHeader>
      <div className="px-3 pb-3">
        {!isLoading && data ? (
          <EventDetail
            data={data}
            swiper={
              swiperData.length && foundInSwiperList
                ? { swiperData, onIndexChange: handleIndexChange }
                : undefined
            }
            useCol
            useGo
          />
        ) : (
          <AppSpin />
        )}
      </div>
    </div>
  )
})

RightEventDetail.displayName = 'RightEventDetail'

export default RightEventDetail
