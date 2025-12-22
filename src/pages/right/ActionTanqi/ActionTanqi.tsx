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
import mitt from 'mitt'
import HumanInLoopDialog from './components/HumanInLoopDialog'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'

type PropsType = unknown

enum APState {
  Idle = 0, // 空闲
  Thinking = 1, // 思考中
  Replying = 2, // 回答中
}

export const actionTanqiEmitter = mitt<{
  resolveEvent: API_EVENTS.domain.Event
}>()

const ActionTanqi: FC<PropsType> = memo(() => {
  const [t] = useTranslation()
  const username = useUserStore((s) => s.user?.username)
  const actionId = useParams().actionId
  const groupName = username && actionId ? `ds-${username}-${actionId}` : ''

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

  const {
    replyingContent,
    currentToolCalls,
    sendMessage,
    clearCurrentToolCalls,
  } = useSendMessage({
    onStartReply: () => {
      setAiState(APState.Replying)
    },
    // 结束时
    onEndReply: (content) => {
      currentMessageRef.current = ''
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
        id: `refresh-${Date.now()}`,
        role: 'user',
        content: message,
        created_at: dayjs().format(),
      },
    ])
  }

  const willSendMessage = useRef('')

  const currentMessageRef = useRef('')
  // 发送消息
  const handleSubmit = useMemoizedFn(
    async (message: string, metadata: Record<string, any> = {}) => {
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
        currentMessageRef.current = message
        await sendMessage(cId, message, metadata)
      } finally {
        setAiState(APState.Idle)
        setSending(false)
      }
    },
  )

  useEffect(() => {
    const fn = (payload: API_EVENTS.domain.Event) => {
      handleSubmit(`${payload.deviceName} 设备出现告警，请处理`, payload)
    }

    actionTanqiEmitter.on('resolveEvent', fn)
    return () => {
      actionTanqiEmitter.off('resolveEvent', fn)
    }
  }, [])

  // 停止对话
  const handleStop = useMemoizedFn(async () => {
    await stopChat(chatId!)
    setAiState(0)
    setSending(false)
  })

  const [appendedRows, setApendedRows] = useState<any[]>([])
  const {
    data: chatDetail,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['chatDetail', chatId],
    queryFn: async () => {
      const res = await getChats(chatId!)
      return res.data
        ?.map((e) => ({
          ...e,
          content: shouldJson(e.content) ?? e.content,
        }))
        .filter((e) => {
          if (e.role === 'tool_calls') {
            return false
          }
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

  useEffect(() => {
    setApendedRows([])
  }, [chatId])

  useEffect(() => {
    if (willSendMessage.current) {
      handleSubmit(willSendMessage.current)
      willSendMessage.current = ''
    }
  }, [chatDetail])

  // 显示的内容
  const conversationDetailData = useMemo(() => {
    const data = [...(chatDetail ?? []), ...appendedRows]
    // 回复内容
    const humanInTheLoopFn = currentToolCalls.find((tc) => {
      if (!tc || typeof tc !== 'object') {
        return false
      }
      if (tc.type === 'function' && tc.function?.name === 'human_in_the_loop') {
        return true
      }
    })
    if (replyingContent || humanInTheLoopFn) {
      const getDisplayContent = () => {
        if (humanInTheLoopFn) {
          return (
            <div className="w-full">
              <div>{replyingContent}</div>
              {humanInTheLoopFn && (
                <HumanInLoopDialog
                  humanInTheLoopPayload={humanInTheLoopFn}
                  onFinish={clearCurrentToolCalls}
                />
              )}
            </div>
          )
        }
        return replyingContent
      }

      data.push({
        role: 'assistant',
        content: getDisplayContent(),
        created_at: dayjs().format(),
      })
    }
    return data
  }, [chatDetail, appendedRows, replyingContent, currentToolCalls])

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
                  tippyProps={{ content: t('tanqi.refreshChat') }}
                  onClick={async () => {
                    await refetch()
                    setApendedRows([
                      {
                        id: `refresh-${Date.now()}`,
                        role: 'user',
                        content: currentMessageRef.current,
                        created_at: dayjs().format(),
                      },
                    ])
                  }}
                >
                  <IconRefresh className="scale-90" />
                </IconButton>
              )}
              {chatId && (
                <IconButton
                  className="text-sm"
                  tippyProps={{ content: '新建会话' }}
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
