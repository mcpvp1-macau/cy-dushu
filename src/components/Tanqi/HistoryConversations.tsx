import IconButtonWithDropDown from '@/components/ui/button/IconButtonWithDropDown'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getConversations } from '@/service/modules/diting-tanqi'
import { HistoryOutlined } from '@ant-design/icons'
import HistoryConversationItem from './HistoryConversationItem'

type PropsType = {
  groupName: string
}

const Conversations: FC<PropsType> = memo(({ groupName }) => {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: ['diting-tanqi', 'conversations', groupName],
      queryFn: () => getConversations({ group_name: groupName }),
      enabled: !!groupName,
      select: (d) => d.data,
    },
    queryClient,
  )

  const historyChatGroup = useMemo(() => {
    const group = [
      ['today', []],
      ['yesterday', []],
      ['last7Days', []],
      ['last30Days', []],
      ['before', []],
    ] as [string, API_DITING_TANQI.domain.ConversationItem[]][]

    if (!data?.content) {
      return group
    }

    const now = dayjs()
    for (const item of data.content) {
      const date = dayjs(item.create_time)
      if (date.isSame(now, 'day')) {
        group[0][1].push(item)
      } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
        group[1][1].push(item)
      } else if (date.isAfter(now.subtract(7, 'day'))) {
        group[2][1].push(item)
      } else if (date.isAfter(now.subtract(30, 'day'))) {
        group[3][1].push(item)
      } else {
        group[4][1].push(item)
      }
    }

    return group
  }, [data])

  return (
    <IconButtonWithDropDown
      disabled={data?.content?.length === 0}
      tippyProps={{ content: t('tanqi.historyChat.title') }}
      placement="topRight"
      trigger={['click']}
      popupRender={() => {
        return (
          <ScrollArea className="flex flex-col gap-3 bg-ground-1 p-2 rounded max-h-[60vh]">
            {historyChatGroup
              .filter(([, value]) => value.length > 0)
              .map(([key, value]) => {
                return (
                  <div key={key}>
                    <div className="text-fore">
                      {t(`tanqi.historyChats.${key}.title`)}
                    </div>
                    <ul>
                      {value.map((item) => {
                        return (
                          <HistoryConversationItem
                            key={item.id}
                            item={item}
                            groupName={groupName}
                          />
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
          </ScrollArea>
        )
      }}
    >
      <HistoryOutlined />
    </IconButtonWithDropDown>
  )
})

Conversations.displayName = 'Conversations'

export default Conversations
