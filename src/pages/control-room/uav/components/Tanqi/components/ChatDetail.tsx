import IconTanQi from '@/assets/icons/jsx/IconTanQi'
import { UserOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { GetProp } from 'antd'
import ChatDetailContent from './ChatDetailContent'

type PropsType = {
  aiState: 0 | 1 | 2
  bubbles: any[]
}

type Item = GetProp<typeof Bubble.List, 'items'>[0]

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    avatar: {
      icon: <IconTanQi />,
      className: 'bg-ground-4',
    },
    typing: { step: 2, interval: 50 },
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

const ChatDetail: FC<PropsType> = memo(({ aiState, bubbles }) => {
  const items = useMemo<Item[]>(() => {
    const items = bubbles.map<Item>((e) => ({
      role: e.recordType === 'REQUEST' ? 'user' : 'ai',
      content: (
        <ChatDetailContent
          type={e.recordType}
          message={
            e.recordType === 'REQUEST' ? e.sendMessage : e.responseMessage
          }
        />
      ),
      loading: false,
      header: e.recordType === 'REQUEST' ? e.gmtCreateBy : '檀棋',
    }))
    if (aiState === 1) {
      return [
        ...items,
        {
          role: 'ai',
          header: '檀棋',
          loading: true,
        },
      ]
    }
    return items
  }, [aiState, bubbles])

  return (
    <Bubble.List
      autoScroll
      className="tanqi-chat flex-1 overflow-y-auto px-2 pt-2"
      roles={roles}
      items={items}
    />
  )
})

ChatDetail.displayName = 'ChatDetail'

export default ChatDetail
