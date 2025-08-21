import { useAppMsg } from '@/hooks/useAppMsg'
import serverDitingMCP from '@/service/servers/serverDitingMCP'
import { parseEvent } from './useSendMessage'
import { useGetState } from 'ahooks'
import { shouldJson } from '@/utils/json'

/** 任务理解 */
const useTaskUnderstanding = (
  open: boolean,
  conversationId: number,
  options: {
    onStopMessage: (content: string) => void
  },
) => {
  const readerRef = useRef<ReadableStreamDefaultReader<
    Uint8Array<ArrayBufferLike>
  > | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const msgApi = useAppMsg()

  // 回复内容
  const [replyingContent, setContent, getContent] = useGetState('')

  // 开始任务理解
  const startTaskUnderstanding = useMemoizedFn(async () => {
    const controller = new AbortController()
    abortControllerRef.current = controller

    const resp = await fetch(
      `${serverDitingMCP.baseURL}/api/task/conversation_streams/${conversationId}`,
      {
        method: 'GET',
        signal: controller.signal,
      },
    )

    const reader = resp.body?.getReader()
    if (!reader) {
      msgApi.error('任务理解开启失败，未获取到数据流')
      return
    }

    const decoder = new TextDecoder('utf-8')
    readerRef.current = reader

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      const buffer = decoder.decode(value, { stream: true })

      const lines = buffer.split('\n\n')

      for (const event of lines) {
        if (event.trim() === '') continue
        const eventData = parseEvent(event)
        const data = eventData.data
        const choice0: Record<string, any> = data?.choices?.[0] ?? {}
        const content =
          shouldJson(choice0.delta?.content) ?? choice0.delta?.content

        if (choice0.finish_reason === 'stop') {
          if (typeof content === 'string') {
            options.onStopMessage(getContent() + content)
            setContent('')
          } else {
            options.onStopMessage(content)
          }
        } else {
          setContent((prev) => prev + (content ?? ''))
        }
      }
    }
    readerRef.current = null
    abortControllerRef.current = null
  })

  const cancelTaskUnderstanding = useMemoizedFn(() => {
    // 取消可读流
    if (readerRef.current) {
      readerRef.current.cancel()
      readerRef.current = null
    }
    // 中止请求 (说不定还在请求中😡~)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  })

  useEffect(() => {
    if (!open || !conversationId) {
      return
    }

    startTaskUnderstanding()

    return cancelTaskUnderstanding
  }, [open, conversationId])

  return {
    replyingContent,
  }
}

export default useTaskUnderstanding
