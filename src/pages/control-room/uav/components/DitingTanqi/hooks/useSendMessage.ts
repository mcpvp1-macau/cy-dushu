import { ConfigType } from '@/global/config'
import serverDitingTanqi from '@/service/servers/serverDitingTanqi'
import { chunkBuffer } from '@/utils/decode/http-chunk'
import { shouldJson } from '@/utils/json'
import { useGetState } from 'ahooks'

export const parseEvent = (eventText: string) => {
  if (eventText.startsWith('data:')) {
    return {
      data: shouldJson(eventText.slice(5).trim()),
    }
  }
  return {
    data: shouldJson(eventText.trim()),
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

      const mcp_servers: NonNullable<ConfigType['mcps']>[string][] = []
      if (
        options?.openUnderstand &&
        globalConfig.mcps?.['taskunderstand-114']
      ) {
        mcp_servers.push(globalConfig.mcps['taskunderstand-114'])
      }
      if (
        options?.openCommandControl &&
        globalConfig.mcps?.['tanqi-mcp-dushu-flycontrol']
      ) {
        mcp_servers.push(globalConfig.mcps['tanqi-mcp-dushu-flycontrol'])
      }

      try {
        const resp = await fetch(
          `${serverDitingTanqi.baseURL}/user/conversations/${conversationId}/chats`,
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
          options?.onEndReply?.('error: ' + resp.statusText)
          return
        }

        if (resp.headers['content-type'] === 'application/json') {
          const json = await resp.json()
          console.error('json', json)
          return
        }

        const reader = resp.body?.getReader()
        if (!reader) {
          throw new Error('No reader found')
        }
        let replayStart = false

        for await (const chunk of chunkBuffer(reader)) {
          const eventData = parseEvent(chunk)
          const data = eventData.data
          const content: string | undefined = data?.choices?.[0]?.delta?.content
          if (content) {
            if (!replayStart) {
              options?.onStartReply?.()
              replayStart = true
            }
            const c = shouldJson(content) ?? content
            if (typeof c === 'object') {
              const toolCalls = c.tool_calls || c.tool_call_id
              if (toolCalls) {
                continue
              }
            }
            setContent((prev) => prev + c)
          }
        }
        options?.onEndReply?.(getContent())
        setContent('')
      } catch (error) {
        console.error('Error sending message:', error)
        setDone(true)
        if (error instanceof Error) {
          options?.onEndReply?.(
            `error${error.message ? `: ${error.message}` : ''}`,
          )
        }
      }
    },
  )

  return {
    replyingContent,
    done,
    sendMessage,
  }
}

// /** @deprecated */
// const mkMcpServer = (payload: API_DITING_TANQI.domain.McpServerInfo) => {
//   return {
//     name: payload.name,
//     url: (payload.url || '') + (payload.sse_endpoint || ''),
//     tools: payload.tools?.map((t) => ({ name: t.name })) || [],
//   }
// }

export default useSendMessage
