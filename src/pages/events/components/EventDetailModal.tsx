import XModal from '@/components/XModal'
import EventDetail from './EventDetail'
import TextButton from '@/components/ui/button/TextButton'

type PropsType = {
  data: API_EVENTS.domain.Event
  rows?: API_EVENTS.domain.Event[]
}

const EventDetailModal: FC<PropsType> = memo(({ data, rows }) => {
  const [open, { setTrue, setFalse }] = useBoolean()
  const { t } = useTranslation()

  const [index, setIndex] = useState(-1)
  const handleIndexChange = (index: number) => {
    setIndex(index)
  }

  const currentData = rows?.[index] ?? data

  return (
    <>
      <TextButton onClick={setTrue}>{t('common.detail')}</TextButton>
      {open && (
        <XModal
          title={`${currentData.eventName}(${currentData.id})`}
          centered
          noPadding
          open={open}
          onClose={setFalse}
          footer={false}
          width="50%"
        >
          <div className="p-3">
            <EventDetail
              data={currentData}
              swiper={
                rows
                  ? { swiperData: rows, onIndexChange: handleIndexChange }
                  : undefined
              }
            />
          </div>
        </XModal>
      )}
    </>
  )
})

EventDetailModal.displayName = 'EventDetailModal'

export default EventDetailModal
