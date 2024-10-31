import { memo, type FC } from 'react'
import CloseableHeader from './components/CloseableHeader'
import { algorithmIconMap } from '@/components/device/algorithm/AlgorithmListItem'
import EventDetail from '../events/components/EventDetail'
import useRightMode from '@/store/layout/useRightMode.store'
import { getEventDetail } from '@/service/modules/events'
import { QuestionCircleFilled } from '@ant-design/icons'

type PropsType = unknown

const RightEventDetail: FC<PropsType> = memo(() => {
  const eventId = useRightMode((s) => s.detailId)

  const queryClient = useQueryClient()
  const { data } = useQuery(
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

  return (
    <div className="w-[350px] backdrop-blur">
      <CloseableHeader>
        <div className="flex gap-2 items-center">
          <Icon />
          <h6 className="text-white text-base">{data?.eventName}</h6>
        </div>
      </CloseableHeader>
      <div className="px-3 pb-3">
        <EventDetail eventId={eventId ?? ''} useCol />
      </div>
    </div>
  )
})

RightEventDetail.displayName = 'RightEventDetail'

export default RightEventDetail
