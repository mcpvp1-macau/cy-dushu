import XModal from '@/components/XModal'
import EventDetail from './EventDetail'
import TextButton from '@/components/ui/button/TextButton'
import { getEventDetail } from '@/service/modules/events'
import { LoadingOutlined } from '@ant-design/icons'
import AppSpin from '@/components/AppSpin'

type PropsType = {
  // 事件 ID 和 事件数据 必须要有一个
  /** 事件ID */
  eventId?: string
  /** 事件数据 */
  data?: API_EVENTS.domain.Event

  rows?: API_EVENTS.domain.Event[]
}

const EventDetailModal: FC<PropsType> = memo(({ eventId, data, rows }) => {
  const [open, { setTrue, setFalse }] = useBoolean()
  const { t } = useTranslation()

  const [index, setIndex] = useState(-1)
  const handleIndexChange = (index: number) => {
    setIndex(index)
  }

  const queryClient = useQueryClient()
  const { data: queryData } = useQuery(
    {
      queryKey: ['getEventDetail', eventId],
      queryFn: () => getEventDetail(eventId!),
      enabled: open && !!eventId && !data,
      select: (d) => d.data,
    },
    queryClient,
  )

  const currentData = rows?.[index] ?? queryData ?? data

  return (
    <>
      <TextButton onClick={setTrue}>{t('common.detail')}</TextButton>
      {open && (
        <XModal
          title={
            !currentData ? (
              <LoadingOutlined />
            ) : (
              `${currentData.eventName}(${currentData.id})`
            )
          }
          centered
          noPadding
          open={open}
          onClose={setFalse}
          footer={false}
          width={{
            xs: '100%',
            sm: '100%',
            md: '80%',
            lg: '70%',
            xl: '50%',
            xxl: '45%',
          }}
        >
          <div className="p-3">
            {currentData ? (
              <EventDetail
                data={currentData}
                useGo={false}
                swiper={
                  rows
                    ? { swiperData: rows, onIndexChange: handleIndexChange }
                    : undefined
                }
              />
            ) : (
              <AppSpin />
            )}
          </div>
        </XModal>
      )}
    </>
  )
})

EventDetailModal.displayName = 'EventDetailModal'

export default EventDetailModal
