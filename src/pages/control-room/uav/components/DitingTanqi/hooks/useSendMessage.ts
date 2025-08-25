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
  mcps: Record<string, API_DITING_TANQI.domain.McpServerInfo>
}) => {
  // 回复内容
  const [replyingContent, setContent, getContent] = useGetState('')
  const [done, setDone] = useState(false)

  const sendMessage = useMemoizedFn(
    async (conversationId: number, message: string) => {
      setContent('')
      setDone(false)

      const mcp_servers: ReturnType<typeof mkMcpServer>[] = []
      if (options?.openUnderstand && options?.mcps['taskunderstand-114']) {
        mcp_servers.push(mkMcpServer(options.mcps['taskunderstand-114']))
      }
      if (
        options?.openCommandControl &&
        options?.mcps['tanqi-mcp-dushu-flycontrol']
      ) {
        mcp_servers.push(
          mkMcpServer(options.mcps['tanqi-mcp-dushu-flycontrol']),
        )
      }

      try {
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

        if (resp.status !== 200) {
          console.error('Error response:', resp)
          setDone(true)
          options?.onEndReply?.('Unknown error')
          return
        }

        if (resp.headers['content-type'] === 'application/json') {
          const json = await resp.json()
          console.error('json', json)
          return
        }

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
            const content: string | undefined =
              data?.choices?.[0]?.delta?.content
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
      } catch (error) {
        console.error('Error sending message:', error)
        setDone(true)
        options?.onEndReply?.('error')
      }
    },
  )

  return {
    replyingContent,
    done,
    sendMessage,
  }
}

const mkMcpServer = (payload: API_DITING_TANQI.domain.McpServerInfo) => {
  return {
    name: payload.name,
    url: (payload.url || '') + (payload.sse_endpoint || ''),
    tools: payload.tools?.map((t) => ({ name: t.name })) || [],
  }
}

export default useSendMessage
