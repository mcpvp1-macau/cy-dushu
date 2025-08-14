import serverDitingTanqi from '@/service/servers/serverDitingTanqi'
import { shouldJson } from '@/utils/json'
import { useGetState } from 'ahooks'

function parseEvent(eventText: string) {
  const result = { event: '', data: '', id: '', retry: 0 }
  const lines = eventText.split('\n')
  for (const line of lines) {
    if (line.startsWith('event:')) result.event = line.slice(6).trim()
    else if (line.startsWith('data:'))
      result.data += (result.data ? '\n' : '') + line.slice(5).trim()
    else if (line.startsWith('id:')) result.id = line.slice(3).trim()
    else if (line.startsWith('retry:'))
      result.retry = parseInt(line.slice(6).trim())
  }
  return result
}

const useSendMessage = (options?: {
  onStartReply?: () => void
  onEndReply?: (content: string) => void
}) => {
  // 回复内容
  const [replyingContent, setContent, getContent] = useGetState('')
  const [done, setDone] = useState(false)

  const sendMessage = useMemoizedFn(
    async (conversationId: number, message: string) => {
      setContent('')
      setDone(false)
      const resp = await fetch(
        serverDitingTanqi.baseURL +
          `/user/conversations/${conversationId}/chats`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'tq-authorization': 'sk-CUV0SoZsDKYG9LQmQPtQQXSQFnpa60JL',
          },
          body: JSON.stringify({ message }),
        },
      )

      const reader = resp.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      // eslint-disable-next-line no-constant-condition
      while (true) {
        options?.onStartReply?.()

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
          const data = shouldJson(eventData.data)
          const content: string | undefined =
            data?.choices?.[0]?.message?.content
          if (content) {
            setContent((prev) => prev + content)
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

export default useSendMessage
