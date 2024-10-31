import MenuIconEvents from '@/assets/icons/jsx/menus/MenuIconEvents'
import TagItem from '@/components/TagItem'
import { EventStatusMap } from '@/enum/event'
import { RightModeEnum } from '@/enum/right-mode'
import { ignoreEvent } from '@/service/modules/events'
import useRightMode from '@/store/layout/useRightMode.store'
import { LoadingOutlined } from '@ant-design/icons'
import { Button } from 'antd'

type PropsType = {
  data: API_EVENTS.domain.Event
}

const EventItem: FC<PropsType> = memo(({ data }) => {
  const process = EventStatusMap[data.processStatus]

  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  return (
    <li
      className={clsx(
        'p-3 bg-ground-100 rounded-[3px] transition-colors cursor-pointer',
        'border border-solid border-ground-200 hover:border-primary text-sm',
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
        <TagItem
          color={process?.color ?? '#fff'}
          bgColor={`${process?.color ?? '#ffffff'}44`}
          label={process?.label}
        />
      </div>
      <ul className="text-xs flex flex-col mt-1">
        <li>
          <span>时间: </span>
          <span>{data.eventTime}</span>
        </li>
        <li className="mt-1">
          <span>来源: </span>
          <span>{data.positionName}</span>
        </li>
        <li className="flex justify-between items-center">
          <p>
            <span>等级: </span>
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
                  忽略
                </Button>
                <Button
                  className="ml-2 text-xs px-2.5"
                  size="small"
                  type="primary"
                >
                  处理
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
