import { HeartbeatOptions } from 'react-use-websocket/dist/lib/types'

export const heartbeat: HeartbeatOptions = {
  interval: 10_000,
  message: 'ping',
  returnMessage: 'pong',
  timeout: 6_000,
}
