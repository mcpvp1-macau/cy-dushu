import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import useReachBottom from '@/hooks/useReachBottom'
import { getEventList, ignoreAllEvent } from '@/service/modules/events'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Checkbox, Input, Spin } from 'antd'
import EventItem from './EventItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import IconFilter from '@/assets/icons/jsx/IconFilter'
import { LoadingOutlined } from '@ant-design/icons'
import useEventTypeAndSourceOptions from './hooks/useEventTypeAndSourceOptions'
import IconButton from '@/components/ui/button/IconButton'
import IconClear from '@/assets/icons/jsx/IconClear'
import useEventStore, { useEventData } from '@/store/event/useEvent.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { useDeepCompareEffect, useDebounceFn, useThrottleFn } from 'ahooks'
import IconButtonWithDropDownDialog from '@/components/ui/button/IconButtonWithDropDownDialog'
import SegmentTitle from '@/components/ui/SegmentTitle'

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

  const newEvent = useGlobalWsStore((s) => s.newEvent)

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

  const { refetch } = useEventData()

  const refetchEvent = () => {
    queryClient.invalidateQueries({
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
    })
  }

  const handleClear = () => {
    ignoreAllEvent({}).then((res) => {
      if (res.code === 'SUCCESS') {
        refetchEvent()
        // 刷新地图上的事件
        refetch()
      } else {
        // message.error(res.message)
      }
    })
  }

  const { run } = useThrottleFn(
    () => {
      refetchEvent()
    },
    { wait: 800 },
  )

  useDeepCompareEffect(() => {
    run()
  }, [newEvent])

  const { t } = useTranslation()

  const eventItems = useMemo(() => {
    if (!data) return []
    return data.pages.flatMap((page) => page.rows)
  }, [data])

  const detailEventId = useEventStore((s) => s.detailEventId)
  useEffect(() => {
    useEventStore.getState().updateSwiperEvents(eventItems)
  }, [eventItems])

  const { run: debouncedSetEventName } = useDebounceFn(
    (v: string) => {
      setEventName(v)
    },
    { wait: 500 },
  )

  return (
    <div className="h-full flex flex-col my-3 overflow-hidden">
      <div className="px-3 flex gap-3 text-sm">
        <Input
          placeholder={t('events.search.placeholder')}
          allowClear
          onChange={(e) => debouncedSetEventName(e.target.value)}
        />
        <IconButtonWithDropDownDialog
          title={t('events.filter.title')}
          tippyProps={{ content: t('events.filter.title') }}
          trigger={['click']}
          popupRender={() => (
            <div className="p-2">
              <SegmentTitle
                title={t('events.filter.riskLevel.title')}
                className="mb-1"
              />
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
              <SegmentTitle
                className="mt-3 mb-1"
                title={t('events.filter.source.title')}
              />
              <div>
                <Checkbox.Group
                  options={eventSourceOptions}
                  onChange={setEventSourceList}
                />
              </div>
              <SegmentTitle
                className="mt-3 mb-1"
                title={t('events.filter.type.title')}
              />
              <div>
                <Checkbox.Group
                  options={eventTypeOptions}
                  onChange={setEventTypeList}
                />
              </div>
              <SegmentTitle
                className="mt-3 mb-1"
                title={t('events.filter.status.title')}
              />
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
        </IconButtonWithDropDownDialog>

        <IconButton tippyProps={{ content: '全部忽略' }}>
          <IconClear onClick={handleClear} />
        </IconButton>
      </div>
      <ScrollArea className="grow mt-3 px-3" onScroll={handleScroll}>
        {isLoading || !data ? (
          <AppSpin />
        ) : data.pages.at(-1)?.rows.length === 0 ? (
          <AppEmpty />
        ) : (
          <Spin spinning={isRefetching}>
            <ul className="flex flex-col gap-3">
              {eventItems.map((item) => (
                <EventItem
                  key={item.id}
                  data={item}
                  active={item.eventId == detailEventId}
                />
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
