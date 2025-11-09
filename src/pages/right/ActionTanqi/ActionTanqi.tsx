import IconPlus from '@/assets/icons/jsx/IconPlus'
import AppSpin from '@/components/AppSpin'
import IconButton from '@/components/ui/button/IconButton'
import {
  createConversation,
  getChats,
  stopChat,
} from '@/service/modules/diting-tanqi'
import { shouldJson } from '@/utils/json'
import { useSearchParams } from 'react-router-dom'
import ConversationDetail from '@/components/Tanqi/ConversationDetail'
import Conversations from '@/components/Tanqi/HistoryConversations'
import TanqiSender from '@/components/Tanqi/TanqiSender'
import TanqiWelCome from '@/components/Tanqi/TanqiWelcome'

import useSendMessage from './hooks/useSendMessage'
import useUserStore from '@/store/useUser.store'

type PropsType = unknown

enum APState {
  Idle = 0, // 空闲
  Thinking = 1, // 思考中
  Replying = 2, // 回答中
}

const ActionTanqi: FC<PropsType> = memo(() => {
  const username = useUserStore((s) => s.user?.username)
  const actionId = useParams().actionId
  const groupName = username && actionId ? `ds-${username}-${actionId}` : ''

  const { t } = useTranslation()

  const [searchParams, setSearchParams] = useSearchParams()
  const chatIdStr = searchParams.get('chat')
  const chatId = chatIdStr ? Number(chatIdStr) : undefined

  const toolsRef = useRef<HTMLDivElement>(null)

  // 0 空闲 1 思考中 2 回答中
  const [aiState, setAiState] = useState<APState>(APState.Idle)
  // 是否正在创建会话
  const [creating, setCreating] = useState(false)
  // 是否正在发送消息
  const [sending, setSending] = useState(false)

  const queryClient = useQueryClient()

  // 创建对话
  const newConversation = async () => {
    setCreating(true)
    try {
      const resp = await createConversation({
        group_name: groupName,
        system_message: '',
        metadata: {
          actionId: actionId,
          username: username,
        },
        model: 'tanqi-agent-ds-action',
      })
      if (resp.data.id) {
        const nextSearchParams = new URLSearchParams(searchParams)
        nextSearchParams.set('chat', resp.data.id.toString())
        setSearchParams(nextSearchParams, { replace: true })
      }
      queryClient.invalidateQueries({
        queryKey: ['diting-tanqi', 'conversations', groupName],
      })
      return resp.data?.id
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    setApendedRows([])
    if (willSendMessage.current) {
      handleSubmit(willSendMessage.current)
      willSendMessage.current = ''
    }
  }, [chatId])

  const { replyingContent, sendMessage } = useSendMessage({
    onStartReply: () => {
      setAiState(APState.Replying)
    },
    // 结束时
    onEndReply: (content) => {
      setApendedRows((prev) => [
        ...prev,
        {
          role: 'assistant',
          content,
          created_at: dayjs().format(),
        },
      ])
    },
  })

  // 追加用户消息
  const appendUserMsg = (message: string) => {
    setApendedRows((prev) => [
      ...prev,
      {
        role: 'user',
        content: message,
        created_at: dayjs().format(),
      },
    ])
  }

  const willSendMessage = useRef('')

  // 发送消息
  const handleSubmit = useMemoizedFn(async (message: string) => {
    let cId = chatId
    setSending(true)
    try {
      if (!cId) {
        cId = await newConversation()
        // 等切换完再发送
        willSendMessage.current = message
        // 不能直接调用下面的原因是, 切换后, 会 重新请求 并且把 appendedRows 清空
        return
      }
      appendUserMsg(message)
      setAiState(APState.Thinking)
      await sendMessage(cId, message)
    } finally {
      setAiState(APState.Idle)
      setSending(false)
    }
  })

  // 停止对话
  const handleStop = useMemoizedFn(async () => {
    await stopChat(chatId!)
    setAiState(0)
    setSending(false)
  })

  const [appendedRows, setApendedRows] = useState<any[]>([])
  const { data: chatDetail, isLoading } = useQuery({
    queryKey: ['chatDetail', chatId],
    queryFn: async () => {
      const res = await getChats(chatId!)
      return res.data
        ?.map((e) => ({
          ...e,
          content: shouldJson(e.content) ?? e.content,
        }))
        .filter((e) => {
          if (typeof e.content === 'object') {
            if (e.content.images) {
              return true
            }
            return false
          }
          return !!e.content
        })
    },
    enabled: !!chatId,
  })

  // 显示的内容
  const conversationDetailData = useMemo(() => {
    const data = [...(chatDetail ?? []), ...appendedRows]
    // 回复内容
    if (replyingContent) {
      data.push({
        role: 'assistant',
        content: replyingContent,
        created_at: dayjs().format(),
      })
    }
    return data
  }, [chatDetail, appendedRows, replyingContent])

  return (
    <div className="tanqi size-full overflow-hidden flex flex-col">
      <div className="grow flex flex-col overflow-hidden">
        <div className="grow overflow-hidden flex flex-col relative">
          {creating || isLoading ? (
            <div className="size-full flex items-center justify-center">
              <AppSpin />
            </div>
          ) : !chatId || (!chatDetail?.length && !appendedRows.length) ? (
            <TanqiWelCome />
          ) : (
            <ConversationDetail
              aiState={aiState}
              data={conversationDetailData}
            />
          )}
          {/* 工具栏 */}
          <div
            className="right-4 left-2 pb-2 flex justify-between items-end absolute bottom-0 h-14 pointer-events-none"
            ref={toolsRef}
          >
            <div></div>
            <div className="flex gap-2 items-center pointer-events-auto">
              {chatId && (
                <IconButton
                  className="text-sm"
                  toolTipProps={{ title: t('tanqi.createChat.title') }}
                  onClick={() => {
                    const nextSearchParams = new URLSearchParams(searchParams)
                    nextSearchParams.delete('chat')
                    setSearchParams(nextSearchParams, { replace: true })
                  }}
                >
                  <IconPlus />
                </IconButton>
              )}
              <Conversations groupName={groupName} />
            </div>
          </div>
        </div>

        <div
          className="mb-2 mx-2"
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
        >
          <TanqiSender
            loading={creating || sending}
            onSubmit={handleSubmit}
            onCancel={handleStop}
            foolter={<div className="flex gap-2"></div>}
          />
        </div>
      </div>
    </div>
  )
})

ActionTanqi.displayName = 'ActionTanqi'

export default ActionTanqi
