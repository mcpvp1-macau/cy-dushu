import MenuIconEvents from '@/assets/icons/jsx/menus/MenuIconEvents'
import { EventStatusMap } from '@/enum/event'
import { RightModeEnum } from '@/enum/right-mode'
import { ignoreEvent } from '@/service/modules/events'
import useRightMode from '@/store/layout/useRightMode.store'
import { LoadingOutlined } from '@ant-design/icons'
import { Button } from 'antd'

type PropsType = {
  data: API_EVENTS.domain.Event
  active?: boolean
}

const EventItem: FC<PropsType> = memo(({ data, active }) => {
  const { t } = useTranslation()
  const process = EventStatusMap[data.processStatus]

  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  return (
    <li
      className={clsx(
        'p-3 bg-ground-1 rounded-[3px] transition-colors cursor-pointer',
        'border border-solid border-ground-3 hover:border-primary text-sm',
        {
          'border-primary': active,
        },
      )}
      onClick={() => {
        updateRightMode(RightModeEnum.EVENT_DETAIL)
        updateDetailId(data.eventId)
      }}
    >
      <div className="flex justify-between">
        <div className="flex gap-2">
          <MenuIconEvents />
          <p className="text-white">
            {data.eventName} ({data.id})
          </p>
        </div>
        <div
          className={clsx(
            'px-2 rounded-sm text-xs leading-5 whitespace-nowrap',
          )}
          style={{
            color: process?.textColor || '#fff',
            background: `${process?.bgColor || '#ff0000'}`,
          }}
        >
          {t(`events.status.${process?.key}.title`)}
        </div>
      </div>
      <ul className="text-xs flex flex-col mt-1">
        <li>
          <span>{t('common.time')}: </span>
          <span>{data.eventTime}</span>
        </li>
        <li className="mt-1">
          <span>{t('common.source')}: </span>
          <span>{data.positionName}</span>
        </li>
        <li className="flex justify-between items-center">
          <p>
            <span>{t('common.level')}: </span>
            <span>{data.level}</span>
          </p>
          <div>
            {isLoading ? (
              <LoadingOutlined className="size-[22.5px]" />
            ) : (
              <>
                <Button
                  className="text-xs px-2.5"
                  size="small"
                  onClick={async (e) => {
                    e.stopPropagation()
                    setIsLoading(true)
                    try {
                      await ignoreEvent(data.eventId)
                      queryClient.invalidateQueries({
                        queryKey: ['getEventList'],
                        exact: false,
                      })
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                >
                  {t('common.ignore')}
                </Button>
                <Button
                  className="ml-2 text-xs px-2.5"
                  size="small"
                  type="primary"
                >
                  {t('common.process')}
                </Button>
              </>
            )}
          </div>
        </li>
      </ul>
    </li>
  )
})

EventItem.displayName = 'EventItem'

export default EventItem
