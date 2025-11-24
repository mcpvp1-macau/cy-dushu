import { emtpyArray } from '@/constant/data'
import serverDitingTanqi from '@/service/servers/serverDitingTanqi'
import useUserStore from '@/store/useUser.store'
import { chunkBuffer } from '@/utils/decode/http-chunk'
import { shouldJson } from '@/utils/json'

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
  /** 开始回复时的回调 */
  onStartReply?: () => void
  /** 结束回复时的回调 */
  onEndReply?: (content: string) => void
}) => {
  // 回复内容
  const [replyingContent, setContent] = useState('')
  const [done, setDone] = useState(false)
  const [currentToolCalls, setCurrentToolCalls] = useState<any[]>([])

  const userInfo = useUserStore((s) => s.user)
  const { actionId } = useParams()

  const sendMessage = useMemoizedFn(
    async (
      conversationId: number,
      message: string,
      metadata: Record<string, any> = {},
    ) => {
      setContent('')
      setDone(false)

      const mcp_servers: { url: string; tools: string[] }[] = []
      try {
        const resp = await fetch(
          // `http://localhost:8080/demo1`,
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
              metadata: {
                ...metadata,
                actionId: Number(actionId) || undefined,
                username: userInfo?.username,
                groupId: userInfo?.groupId,
              },
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

        let content_acc = ''
        for await (const chunk of chunkBuffer(reader)) {
          const eventData = parseEvent(chunk)
          const data = eventData.data

          const choice0 = data?.choices?.[0]?.delta ?? {}

          setCurrentToolCalls(emtpyArray)
          if (choice0.role === 'tool_calls') {
            const tool_calls: any[] | undefined = shouldJson(choice0.content)
            console.log('tool_calls', tool_calls)
            if (tool_calls && tool_calls.length > 0) {
              setCurrentToolCalls(tool_calls)
              if (!replayStart) {
                options?.onStartReply?.()
                replayStart = true
              }
            }
          } else {
            const content: string | undefined = choice0.content
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
              content_acc += c
              setContent(content_acc)
            }
          }
        }
        options?.onEndReply?.(content_acc)
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
    currentToolCalls,
    replyingContent,
    done,
    sendMessage,
  }
}

export default useSendMessage
