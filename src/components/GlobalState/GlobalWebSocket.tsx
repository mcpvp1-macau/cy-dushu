import { type FC, memo, useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'
import useUserStore from '@/store/useUser.store'
import useWebSocket from 'react-use-websocket'
import { heartbeat } from '@/constant/websocket'
import { useGlobalWsMessageRouter } from './GlobalWebSocket/useGlobalWsMessageRouter'

type PropsType = unknown

const GlobalWebSocket: FC<PropsType> = memo(() => {
  const username = useUserStore((s) => s.user?.username)
  const handleMessage = useGlobalWsMessageRouter()
  const onMessage = useMemoizedFn((event: WebSocketEventMap['message']) => {
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
