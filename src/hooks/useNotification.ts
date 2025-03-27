import { createContext, useContext } from 'react'
import mitt from 'mitt'
import { ArgsProps, NotificationInstance } from 'antd/es/notification/interface'

export const NotificationContext = createContext<NotificationInstance | null>(
  null,
)

export const useAppNotification = () => {
  return <NotificationInstance>useContext(NotificationContext)
}

export const notificationMitt = mitt<{
  open: ArgsProps
}>()
