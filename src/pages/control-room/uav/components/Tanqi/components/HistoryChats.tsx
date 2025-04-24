import IconButtonWithDropDown from '@/components/ui/button/IconButtonWithDropDown'
import { HistoryOutlined } from '@ant-design/icons'
import HistoryChatItem from './HistoryChatItem'
import { ScrollArea } from '@/components/ui/scroll-area'

type PropsType = {
  data: API_TANQI.domain.DialogTask[]
}

const HistoryChats: FC<PropsType> = memo(({ data }) => {
  const { t } = useTranslation()

  const historyChatGroup = useMemo(() => {
    const group = [
      ['today', []],
      ['yesterday', []],
      ['last7Days', []],
      ['last30Days', []],
      ['before', []],
    ] as [string, API_TANQI.domain.DialogTask[]][]

    if (!data) {
      return group
    }

    const now = dayjs()
    for (const item of data) {
      const date = dayjs(item.gmtCreate)
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
      disabled={data.length === 0}
      tooltipProps={{
        title: t('tanqi.historyChat.title'),
      }}
      placement="topRight"
      trigger={['click']}
      dropdownRender={() => {
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
                        return <HistoryChatItem key={item.id} item={item} />
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

HistoryChats.displayName = 'HistoryChats'

export default HistoryChats
