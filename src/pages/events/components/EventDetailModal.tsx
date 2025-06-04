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

  return (
    <>
      <TextButton onClick={setTrue}>{t('common.detail')}</TextButton>
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
            <EventDetail
              data={rows?.[index] ?? data}
              swipper={
                rows
                  ? { swipperData: rows, onIndexChange: handleIndexChange }
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
