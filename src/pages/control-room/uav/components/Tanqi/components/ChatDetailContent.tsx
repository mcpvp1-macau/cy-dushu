import { makeToolbarRender } from '@/utils/antd/image'
import { FileOutlined } from '@ant-design/icons'
import { Image } from 'antd'
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
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      />
    )
  }

  if (type === 'FILE') {
    const name = content.split('/').pop() || content
    return (
      <div className="my-[0.5em]">
        <a
          href={`/storage/${content}`}
          target="_blank"
          rel="noreferrer"
          download
          className="text-blue-500 hover:underline"
        >
          <FileOutlined className="mr-1" />
          {name}
        </a>
      </div>
    )
  }

  if (type === 'IMAGE') {
    return (
      <div className="my-[0.5em] rounded-[2px] overflow-hidden">
        <Image
          className="block"
          wrapperClassName="block"
          src={`/storage/${content}`}
          alt="image"
          preview={{
            toolbarRender: makeToolbarRender(),
          }}
        />
      </div>
    )
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
