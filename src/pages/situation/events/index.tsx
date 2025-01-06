import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import useReachBottom from '@/hooks/useReachBottom'
import { getEventList } from '@/service/modules/events'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Checkbox, Input, Spin } from 'antd'
import { Fragment } from 'react'
import EventItem from './EventItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import IconButtonWithDropDown from '@/components/IconButtonWithDropDown'
import IconFilter from '@/assets/icons/jsx/IconFilter'
import { LoadingOutlined } from '@ant-design/icons'
import useEventTypeAndSourceOptions from './hooks/useEventTypeAndSourceOptions'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'

type PropsType = unknown

/** 态势事件列表 */
const PageSituationEvents: FC<PropsType> = memo(() => {
  const [eventName, setEventName] = useState('')

  const queryClient = useQueryClient()

  const [[eventSourceOptions, eventTypeOptions], tsIsLoading] =
    useEventTypeAndSourceOptions()

  const [eventLevelList, setEventLevelList] = useState<string[]>([])
  const [eventTypeList, setEventTypeList] = useState<string[]>([])
  const [eventSourceList, setEventSourceList] = useState<string[]>([])
  const [processStatusList, setProcessStatusList] = useState<string[]>([])

  const rightDetailId = useRightMode((s) => {
    if (s.rightMode !== RightModeEnum.EVENT_DETAIL) {
      return null
    }
    return s.detailId
  })

  const {
    data,
    isLoading,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    {
      queryKey: [
        'getEventList',
        {
          eventName,
          eventLevelList,
          eventTypeList,
          eventSourceList,
          processStatusList,
        },
      ],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const { data } = await getEventList({
          eventName: eventName || undefined,
          eventLevelList: eventLevelList.length ? eventLevelList : undefined,
          eventTypeList: eventTypeList.length ? eventTypeList : undefined,
          eventSourceList: eventSourceList.length ? eventSourceList : undefined,
          processStatusList: processStatusList.length
            ? processStatusList
            : ['PENDING', 'PROCESSING'],
          isPage: true,
          page: pageParam,
          size: 15,
        })
        return data
      },
      getNextPageParam: (page, _, lastPageParam) => {
        if (page.rows.length < 15) {
          return undefined
        }
        return lastPageParam + 1
      },
    },
    queryClient,
  )

  const handleScroll = useReachBottom(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  })

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setEventName(e.currentTarget.value)
  }

  const { t } = useTranslation()

  return (
    <div className="h-full flex flex-col my-3 overflow-hidden">
      <div className="px-3 flex gap-3">
        <Input
          placeholder={t('events.search.placeholder')}
          onPressEnter={handlePressEnter}
        />
        <IconButtonWithDropDown
          tooltipProps={{ title: t('events.filter.title') }}
          trigger={['click']}
          dropdownRender={() => (
            <div className="bg-ground-200 p-3 rounded">
              <div className="flex gap-2 items-center">
                <div className="h-[10px] w-[2px] bg-green-500 rounded-sm" />
                <span className="text-white">
                  {t('events.filter.riskLevel.title')}
                </span>
              </div>

              <div>
                <Checkbox.Group
                  options={[
                    {
                      label: t('events.filter.riskLevel.high.title'),
                      value: 'High',
                    },
                    {
                      label: t('events.filter.riskLevel.middle.title'),
                      value: 'Middle',
                    },
                    {
                      label: t('events.filter.riskLevel.low.title'),
                      value: 'Low',
                    },
                  ]}
                  onChange={setEventLevelList}
                />
              </div>
              <div className="flex gap-2 items-center mt-3 mb-1">
                <div className="h-[10px] w-[2px] bg-green-500 rounded-sm" />
                <span className="text-white">
                  {t('events.filter.source.title')}
                </span>
              </div>
              <div>
                <Checkbox.Group
                  options={eventSourceOptions}
                  onChange={setEventSourceList}
                />
              </div>
              <div className="flex gap-2 items-center mt-3 mb-1">
                <div className="h-[10px] w-[2px] bg-green-500 rounded-sm" />
                <span className="text-white">
                  {t('events.filter.type.title')}
                </span>
              </div>
              <div>
                <Checkbox.Group
                  options={eventTypeOptions}
                  onChange={setEventTypeList}
                />
              </div>
              <div className="flex gap-2 items-center mt-3 mb-1">
                <div className="h-[10px] w-[2px] bg-green-500 rounded-sm" />
                <span className="text-white">
                  {t('events.filter.status.title')}
                </span>
              </div>
              <div>
                <Checkbox.Group
                  options={[
                    {
                      label: t('events.filter.status.PENDING.title'),
                      value: 'PENDING',
                    },
                    {
                      label: t('events.filter.status.PROCESSING.title'),
                      value: 'PROCESSING',
                    },
                  ]}
                  onChange={setProcessStatusList}
                />
              </div>
            </div>
          )}
        >
          {tsIsLoading ? <LoadingOutlined /> : <IconFilter />}
        </IconButtonWithDropDown>
      </div>
      <ScrollArea className="grow mt-3 px-3" onScroll={handleScroll}>
        {isLoading || !data ? (
          <AppSpin />
        ) : data.pages.at(-1)?.rows.length === 0 ? (
          <AppEmpty />
        ) : (
          <Spin spinning={isRefetching}>
            <ul className="flex flex-col gap-3">
              {data.pages.map((page, idx) => (
                <Fragment key={idx}>
                  {page.rows.map((item) => (
                    <EventItem
                      key={item.id}
                      data={item}
                      active={item.eventId == rightDetailId}
                    />
                  ))}
                </Fragment>
              ))}
            </ul>
          </Spin>
        )}
        {isFetchingNextPage && <AppSpin />}
      </ScrollArea>
    </div>
  )
})

PageSituationEvents.displayName = 'PageSituationEvents'

export default PageSituationEvents
