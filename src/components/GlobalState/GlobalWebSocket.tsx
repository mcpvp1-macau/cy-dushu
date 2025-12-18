import { type FC, memo, useMemo } from 'react'
import useUserStore from '@/store/useUser.store'
import useWebSocket from 'react-use-websocket'
import { heartbeat } from '@/constant/websocket'
import { useGlobalWsMessageRouter } from './GlobalWebSocket/useGlobalWsMessageRouter'
import { useMemoizedFn } from 'ahooks'
import { useQueryClient } from '@tanstack/react-query'
import { shouldJson } from '@/utils/json'

type PropsType = unknown

const GlobalWebSocket: FC<PropsType> = memo(() => {
  const username = useUserStore((s) => s.user?.username)
  const handleMessage = useGlobalWsMessageRouter()
  const queryClient = useQueryClient()

  const handleAgentRiskEvent = useMemoizedFn(
    (event: WebSocketEventMap['message']) => {
      const parsed = shouldJson<unknown>(event?.data)
      const info =
        (parsed as { event?: { agentRiskEvent?: { info?: unknown } } })?.event
          ?.agentRiskEvent?.info
      if (!info) {
        return
      }

      const conversationId = Number(
        (info as { conversation_id?: string | number })?.conversation_id ??
          Number.NaN,
      )
      if (Number.isNaN(conversationId)) {
        return
      }

      queryClient.resetQueries({ queryKey: ['chatDetail', conversationId] })
    },
  )

  const onMessage = useMemoizedFn((event: WebSocketEventMap['message']) => {
    handleAgentRiskEvent(event)
    handleMessage(event)
  })

  const socketUrl = useMemo(() => {
    if (!username) {
      return ''
    }
    return `${globalConfig.globalWs ?? 'ws'}://${location.host}/ws/${username}`
  }, [username])

  useWebSocket(socketUrl, {
    heartbeat,
    onMessage,
    reconnectAttempts: 0x3f3f3f3f,
    retryOnError: true,
    reconnectInterval: 5_000,
    shouldReconnect: () => true,
  })

  return null
})

GlobalWebSocket.displayName = 'GlobalWebSocket'

export default GlobalWebSocket
