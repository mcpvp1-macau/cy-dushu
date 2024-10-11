import { createContext, useContext } from 'react'
import mitt from 'mitt'
import { ArgsProps, MessageInstance } from 'antd/es/message/interface'

export const AppMsgContext = createContext<MessageInstance | null>(null)

export const useAppMsg = () => {
  return <MessageInstance>useContext(AppMsgContext)
}

export const msgMitt = mitt<{
  open: ArgsProps
}>()
