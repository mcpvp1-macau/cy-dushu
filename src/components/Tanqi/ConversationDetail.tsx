import IconLoading from '@/assets/icons/jsx/IconLoading'
import { ScrollArea } from '@/components/ui/scroll-area'
import { baseURL } from '@/service/servers/serverDitingTanqi'
import { shouldJson } from '@/utils/json'
import { Image } from 'antd'

import markdownit from 'markdown-it'
import React from 'react'
import { ReactNode } from 'react'

const md = markdownit()

type PropsType = {
  aiState: 0 | 1 | 2
  data: API_DITING_TANQI.domain.ChatRecordItem[]
}

const ConversationDetail: FC<PropsType> = memo(({ data, aiState }) => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)

  const items = useMemo(() => {
    const list: {
      role: 'user' | 'ai'
      content: ReactNode | null
      key: string
      isLoading?: boolean
    }[] = []

    data.forEach((e, index) => {
      if (e.role === 'user') {
        list.push({
          role: 'user',
          key: `user-${e.id ?? index}`,
          content: e.content ?? '',
        })
        return
      }

      const parsedContent = shouldJson(e.content) ?? e.content

      list.push({
        role: 'ai',
        key: `ai-${e.id ?? index}`,
        content: renderAiContent(parsedContent),
      })
    })

    if (aiState === 1) {
      list.push({
        role: 'ai',
        key: 'ai-loading',
        content: null,
        isLoading: true,
      })
    }

    return list
  }, [aiState, data])

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]',
    ) as HTMLDivElement | null

    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
    }
  }, [items])

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="tanqi-chat flex-1 overflow-hidden pl-3 pr-2 pt-2 pb-9"
    >
      <div className="flex flex-col gap-3 pr-1">
        {items.map((item) =>
          item.role === 'user' ? (
            <UserMessage key={item.key} content={item.content as string} />
          ) : (
            <AiMessage
              key={item.key}
              content={item.content}
              isLoading={item.isLoading}
            />
          ),
        )}
      </div>
    </ScrollArea>
  )
})

ConversationDetail.displayName = 'ConversationDetail'

export default ConversationDetail

const UserMessage: FC<{ content?: string }> = ({ content }) => (
  <div className="flex w-full justify-end">
    <div className="max-w-full flex flex-col items-end text-right">
      <div className="bg-primary bg-opacity-30 px-3 py-2 rounded-lg text-fore">
        {content ?? ''}
      </div>
    </div>
  </div>
)

const AiMessage: FC<{ content: ReactNode | null; isLoading?: boolean }> = ({
  content,
  isLoading,
}) => {
  if (!content && !isLoading) {
    return null
  }

  return (
    <div className="flex w-full">
      <div className="w-full max-w-full flex flex-col items-start text-left">
        {isLoading ? (
          <IconLoading className="text-fore scale-150 translate-y-1" />
        ) : (
          content
        )}
      </div>
    </div>
  )
}

const renderAiContent = (parsedContent: unknown): ReactNode | null => {
  if (typeof parsedContent === 'string') {
    return (
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: md.render(parsedContent) }}
      />
    )
  }

  if ((parsedContent as { images?: { image_url: string; alt?: string }[] })?.images?.length) {
    const images = (parsedContent as { images?: { image_url: string; alt?: string }[] })?.images ?? []

    return (
      <div>
        <Image.PreviewGroup
          items={images.map((img) => ({
            src: handleImageUrl(img?.image_url),
            alt: img?.alt || 'image',
          }))}
        >
          <Image
            className="rounded overflow-hidden max-w-[200px]"
            src={handleImageUrl(images?.[0]?.image_url)}
          />
        </Image.PreviewGroup>
      </div>
    )
  }

  if (React.isValidElement(parsedContent)) {
    return parsedContent
  }

  return null
}

const handleImageUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url
  }
  return `${baseURL}${baseURL.endsWith('/') ? '' : '/'}${url}`
}
