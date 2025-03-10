import { memo } from 'react'

type PropsType = {
  type: string
  message: any
}

const ChatItem: FC<{
  type: string
  content: string
}> = memo(({ type, content }) => {
  if (type === 'TEXT') {
    return <div dangerouslySetInnerHTML={{ __html: content }} />
  }

  if (type === 'IMAGE') {
    return <img src={`/storage/${content}`} alt="image" />
  }
})

/** 气泡内容 */
const ChatDetailContent = memo<PropsType>(({ type, message }) => {
  if (type === 'REQUEST') {
    return message
  }

  if (Array.isArray(message)) {
    return message.map((item) => (
      <ChatItem key={item.id} type={item.type} content={item.content} />
    ))
  }

  return <ChatItem type={message.type} content={message.content} />
})

ChatDetailContent.displayName = 'ChatDetailContent'

export default ChatDetailContent
