import IconLoading from '@/assets/icons/jsx/IconLoading'
import IconTanQi from '@/assets/icons/jsx/IconTanQi'
import { dft } from '@/constant/time-fmt'
import { UserOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { GetProp } from 'antd'

type PropsType = {
  aiState: 0 | 1 | 2
  data: API_DITING_TANQI.domain.ChatRecordItem[]
}

type Item = GetProp<typeof Bubble.List, 'items'>[0]

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    avatar: {
      icon: <IconTanQi />,
      className: 'bg-ground-4',
    },
    style: {
      maxWidth: 600,
      marginInlineEnd: 44,
    },
    styles: {
      footer: {
        width: '100%',
      },
    },
  },
  user: {
    placement: 'end',
    avatar: {
      icon: <UserOutlined />,
      className: 'bg-ground-4',
      // size: 'small',
    },
  },
}

const ConversationDetail: FC<PropsType> = memo(({ data, aiState }) => {
  const items = useMemo<Item[]>(() => {
    const items = data.map<Item>((e) => ({
      role: e.role === 'user' ? 'user' : 'ai',
      content: e.content,
      loading: false,
      header: e.role === 'user' ? dayjs(e.create_time).format(dft) : '檀棋',
    }))
    if (aiState === 1) {
      return [
        ...items,
        {
          role: 'ai',
          header: '檀棋',
          loading: true,
          loadingRender: () => <IconLoading className="text-fore scale-150" />,
        },
      ]
    }
    return items
  }, [aiState, data])

  return (
    <Bubble.List
      autoScroll
      className="tanqi-chat flex-1 overflow-y-auto px-2 pt-2"
      roles={roles}
      items={items}
    />
  )
})

ConversationDetail.displayName = 'ConversationDetail'

export default ConversationDetail
