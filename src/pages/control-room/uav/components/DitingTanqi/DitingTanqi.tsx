import { useSearchParams } from 'react-router-dom'
import Conversations from './components/HistoryConversations'
import {
  createConversation,
  getChats,
  stopChat,
} from '@/service/modules/diting-tanqi'
import AppSpin from '@/components/AppSpin'
import useSendMessage from './hooks/useSendMessage'
import ConversationDetail from './components/ConversationDetail'
import TanqiWelCome from './components/TanqiWelcome'
import useGroupName from './hooks/useGroupName'
import TanqiSender from './components/TanqiSender'
import IconButton from '@/components/ui/button/IconButton'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import { shouldJson } from '@/utils/json'
import { getUavInfo } from '@/service/modules/diting-mcp'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useAppMsg } from '@/hooks/useAppMsg'
import { Button } from 'antd'
import IconIntelligence from '@/assets/icons/jsx/IconIntelligence'
import useMCPStream from './hooks/useMCPStream'
import IconCommand from '@/assets/icons/jsx/IconCommand'
import useMCPTools from './hooks/useMCPTools'
import { useInViewport } from 'ahooks'
import { getDeviceDetail } from '@/service/modules/device'

type PropsType = unknown

enum APState {
  Idle = 0, // 空闲
  Thinking = 1, // 思考中
  Replying = 2, // 回答中
}

/** 谛听版 檀棋 */
const DitingTanqi: FC<PropsType> = memo(() => {
  const groupName = useGroupName()

  const { t } = useTranslation()
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)

  const [searchParams, setSearchParams] = useSearchParams()
  const chatIdStr = searchParams.get('chat')
  const chatId = chatIdStr ? Number(chatIdStr) : undefined

  // 任务理解开关
  const [openUnderstand, setOpenUnderstand] = useState(false)
  // 指令控制开关
  const [openCommand, setOpenCommand] = useState(false)

  const toolsRef = useRef<HTMLDivElement>(null)
  // const [inViewport] = useInViewport(toolsRef)
  // const { mcps, isLoading: mcpLoading } = useAllMCP(!!inViewport)

  // 0 空闲 1 思考中 2 回答中
  const [aiState, setAiState] = useState<APState>(APState.Idle)
  // 是否正在创建会话
  const [creating, setCreating] = useState(false)
  // 是否正在发送消息
  const [sending, setSending] = useState(false)

  const msgApi = useAppMsg()

  const queryClient = useQueryClient()
  // 创建对话
  const newConversation = async () => {
    if (!deviceDetail) {
      return
    }
    let sn = deviceDetail.sn
    // 尝试获取父设备的sn
    if (deviceDetail.parentId) {
      const parentDetail = await getDeviceDetail(deviceDetail.parentId)
      sn = parentDetail?.data?.sn || sn
    }
    if (!sn) {
      msgApi.error('无法获取设备SN, 请稍后再试')
      return
    }
    const resp = await getUavInfo(sn)
    const uav_name = resp.data.uav_name
    if (!uav_name) {
      msgApi.error('当前无人机未绑定到MCP, 无法使用谛听檀棋')
      return
    }

    setCreating(true)
    try {
      const resp = await createConversation({
        group_name: groupName,
        system_message:
          '当前操作的为无人机为: ' + JSON.stringify({ uav_name: uav_name }),
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

  const [inViewport] = useInViewport(toolsRef)
  const flyControlMCPTools = useMCPTools('FlyControl', !!inViewport)
  const taskUnderstandMCPTools = useMCPTools('TaskUnderstand', !!inViewport)

  const { replyingContent, sendMessage } = useSendMessage({
    openUnderstand,
    understandTools: taskUnderstandMCPTools.mcps ?? [],
    openCommandControl: openCommand,
    commandControlTools: flyControlMCPTools.mcps ?? [],
    // 开始时
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

  const { replyingContent: taskUnderstandingReplyingContent } = useMCPStream(
    !!chatId,
    chatId ?? 0,
    {
      onStopMessage: (content) => {
        setApendedRows((prev) => [
          ...prev,
          {
            role: 'assistant',
            content,
            created_at: dayjs().format(),
          },
        ])
        setAiState(APState.Idle)
      },
    },
  )

  // 显示的内容
  const conversationDetailData = useMemo(() => {
    const data = [...(chatDetail ?? []), ...appendedRows]
    // 任务理解内容
    if (taskUnderstandingReplyingContent) {
      data.push({
        role: 'assistant',
        content: taskUnderstandingReplyingContent,
        created_at: dayjs().format(),
      })
    }
    // 回复内容
    if (replyingContent) {
      data.push({
        role: 'assistant',
        content: replyingContent,
        created_at: dayjs().format(),
      })
    }
    return data
  }, [
    chatDetail,
    appendedRows,
    replyingContent,
    taskUnderstandingReplyingContent,
  ])

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
            className="right-4 left-2 pb-2 flex justify-between items-end absolute bottom-0 h-14 bg-gradient-to-b from-transparent to-ground-2 pointer-events-none"
            ref={toolsRef}
          >
            <div></div>
            <div className="flex gap-2 items-center pointer-events-auto">
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
              <Conversations />
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
            foolter={
              <div className="flex gap-2">
                <Button
                  size="small"
                  icon={<IconIntelligence />}
                  type={openUnderstand ? 'primary' : 'default'}
                  disabled={taskUnderstandMCPTools.mcps.length === 0}
                  loading={taskUnderstandMCPTools.isLoading}
                  onClick={() => {
                    if (!openUnderstand) {
                      handleSubmit('请关注画面内容, 进行任务理解')
                    }
                    setOpenUnderstand(!openUnderstand)
                  }}
                >
                  {t('tanqi.taskUnderstanding.title')}
                </Button>
                <Button
                  size="small"
                  icon={<IconCommand />}
                  type={openCommand ? 'primary' : 'default'}
                  disabled={flyControlMCPTools.mcps.length === 0}
                  loading={flyControlMCPTools.isLoading}
                  onClick={() => setOpenCommand(!openCommand)}
                >
                  {t('tanqi.commandControl.title')}
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </div>
  )
})

DitingTanqi.displayName = 'DitingTanqi'

export default DitingTanqi
