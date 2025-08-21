import serverDitingTanqi from '@/service/servers/serverDitingTanqi'
import { shouldJson } from '@/utils/json'
import { useGetState } from 'ahooks'

export const parseEvent = (eventText: string) => {
  if (eventText.startsWith('data:')) {
    return {
      data: shouldJson(eventText.slice(5).trim()),
    }
  }
  return {
    data: undefined,
  }
}

const useSendMessage = (options?: {
  /** 是否开启任务理解 */
  openUnderstand?: boolean
  /** 是否开启指令控制 */
  openCommandControl?: boolean
  /** 开始回复时的回调 */
  onStartReply?: () => void
  /** 结束回复时的回调 */
  onEndReply?: (content: string) => void
}) => {
  // 回复内容
  const [replyingContent, setContent, getContent] = useGetState('')
  const [done, setDone] = useState(false)

  const sendMessage = useMemoizedFn(
    async (conversationId: number, message: string) => {
      setContent('')
      setDone(false)

      const mcp_servers: (typeof mcpServersWithTaskUnderstanding)[] = []
      if (options?.openUnderstand) {
        mcp_servers.push(mcpServersWithTaskUnderstanding)
      }
      if (options?.openCommandControl) {
        mcp_servers.push(mcpServersWithCommandControl)
      }

      const resp = await fetch(
        serverDitingTanqi.baseURL +
          `/user/conversations/${conversationId}/chats`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'tq-authorization': 'sk-CUV0SoZsDKYG9LQmQPtQQXSQFnpa60JL',
          },
          body: JSON.stringify({
            message,
            mcp_servers,
          }),
        },
      )

      const reader = resp.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      let replayStart = false

      // eslint-disable-next-line no-constant-condition
      while (true) {
        // 读取数据
        const { value, done: doneReading } = (await reader?.read()) || {}
        if (doneReading) {
          setDone(doneReading)
          break
        }

        const buffer = decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')

        for (const event of lines) {
          if (event.trim() === '') continue
          const eventData = parseEvent(event)
          const data = eventData.data
          const content: string | undefined = data?.choices?.[0]?.delta?.content
          if (content) {
            if (!replayStart) {
              options?.onStartReply?.()
              replayStart = true
            }
            const c = shouldJson(content) ?? content
            // console.log('c', c)
            if (typeof c === 'object') {
              const toolCalls = c.tool_calls || c.tool_call_id
              if (toolCalls) {
                continue
              }
            }

            setContent((prev) => prev + c)
          }
        }
      }

      options?.onEndReply?.(getContent())
      setContent('')
    },
  )

  return {
    replyingContent,
    done,
    sendMessage,
  }
}

const mcpServersWithTaskUnderstanding = {
  name: 'taskunderstand-114',
  url: 'http://172.21.30.114:8052/mcp/dushu/taskunderstand/sse',
  tools: [
    {
      name: 'update_task',
    },
    {
      name: 'pause_task',
    },
    {
      name: 'resume_task',
    },
  ],
}

const mcpServersWithCommandControl = {
  name: 'tanqi-mcp-dushu-flycontrol',
  url: 'http://172.21.30.114:8052/mcp/dushu/flycontrol/sse',
  tools: [
    {
      name: 'get_uav_info',
    },
    // {
    //   name: 'get_uav_video',
    // },
    {
      name: 'uav_fly_control',
    },
    {
      name: 'uav_fly_to',
    },
    {
      name: 'uav_takeoff',
    },
    {
      name: 'uav_go_home',
    },
    {
      name: 'uav_stop',
    },
    {
      name: 'uav_gimbal_control',
    },
    {
      name: 'search_location_info',
    },
  ],
}

export default useSendMessage
