import { useAppMsg } from '@/hooks/useAppMsg'
import serverDitingMCP from '@/service/servers/serverDitingMCP'
import { parseEvent } from './useSendMessage'
import { useGetState } from 'ahooks'
import { shouldJson } from '@/utils/json'
import { chunkBuffer } from '@/utils/decode/http-chunk'

/** MCP 消息流 */
const useMCPStream = (
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
  const qc = useQueryClient()

  // 开始MCP消息流
  const start = useMemoizedFn(async () => {
    const controller = new AbortController()
    abortControllerRef.current = controller

    const resp = await fetch(
      `${serverDitingMCP.baseURL}/api/conversations/${conversationId}/stream`,
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
    readerRef.current = reader

    for await (const chunk of chunkBuffer(reader)) {
      if (chunk.trim() === '') continue
      const eventData = parseEvent(chunk)
      const data = eventData.data
      const choice0: Record<string, any> = data?.choices?.[0] ?? {}

      if (
        choice0.delta.role === 'fly-plan-start' ||
        choice0.delta.role === 'fly-plan-end'
      ) {
        qc.invalidateQueries({ queryKey: ['tanqiFlyPlan', conversationId] })
        continue
      }

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

    readerRef.current = null
    abortControllerRef.current = null
  })

  const cancel = useMemoizedFn(() => {
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

    start()

    return cancel
  }, [open, conversationId])

  return {
    replyingContent,
  }
}

export default useMCPStream
