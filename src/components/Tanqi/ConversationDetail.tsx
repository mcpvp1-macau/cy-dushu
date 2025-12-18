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
      content: ReactNode
      key: string
    }[] = []

    data.forEach((e, index) => {
      if (e.role === 'user') {
        list.push({
          role: 'user',
          key: `user-${e.id ?? index}`,
          content: (
            <div className="bg-primary bg-opacity-30 px-3 py-2 rounded-lg text-fore">
              {e.content ?? ''}
            </div>
          ),
        })
        return
      }

      const parsedContent = shouldJson(e.content) ?? e.content
      let content: ReactNode | null = null

      if (typeof parsedContent === 'string') {
        content = (
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: md.render(parsedContent) }}
          />
        )
      } else if (parsedContent?.images?.length) {
        content = (
          <div>
            <Image.PreviewGroup
              items={parsedContent?.images?.map(
                (img: { image_url: string; alt?: string }) => ({
                  src: handleImageUrl(img?.image_url),
                  alt: img?.alt || 'image',
                }),
              )}
            >
              <Image
                className="rounded overflow-hidden max-w-[200px]"
                src={handleImageUrl(parsedContent?.images?.[0]?.image_url)}
              />
            </Image.PreviewGroup>
          </div>
        )
      } else if (React.isValidElement(parsedContent)) {
        // 判断是否为 JSX.Element
        content = parsedContent
      }

      if (content) {
        list.push({
          role: 'ai',
          key: `ai-${e.id ?? index}`,
          content,
        })
      }
    })

    if (aiState === 1) {
      list.push({
        role: 'ai',
        key: 'ai-loading',
        content: <IconLoading className="text-fore scale-150 translate-y-1" />,
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
        {items.map((item) => (
          <div
            key={item.key}
            className={
              item.role === 'user' ? 'flex w-full justify-end' : 'flex w-full'
            }
          >
            <div
              className={
                item.role === 'user'
                  ? 'max-w-full flex flex-col items-end text-right'
                  : 'w-full max-w-full flex flex-col items-start text-left'
              }
            >
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
})

ConversationDetail.displayName = 'ConversationDetail'

export default ConversationDetail

const handleImageUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url
  }
  return `${baseURL}${baseURL.endsWith('/') ? '' : '/'}${url}`
}
