import IconLoading from '@/assets/icons/jsx/IconLoading'
import { baseURL } from '@/service/servers/serverDitingTanqi'
import { shouldJson } from '@/utils/json'
import { Bubble } from '@ant-design/x'
import { GetProp, Image } from 'antd'

import markdownit from 'markdown-it'
import React from 'react'
import { ReactNode } from 'react'

const md = markdownit()

type PropsType = {
  aiState: 0 | 1 | 2
  data: API_DITING_TANQI.domain.ChatRecordItem[]
}

type Item = GetProp<typeof Bubble.List, 'items'>[0]

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',

    style: {
      maxWidth: '100%',
      // marginInlineEnd: 44,
    },
    styles: {
      footer: {
        width: '100%',
      },
    },
  },
  user: {
    placement: 'end',
  },
}

const ConversationDetail: FC<PropsType> = memo(({ data, aiState }) => {
  const items = useMemo<Item[]>(() => {
    const items = data
      .map<Item | null>((e) => {
        if (e.role === 'user') {
          return {
            role: 'user',
            content: (
              <div className="bg-primary bg-opacity-30 px-2 py-1 rounded">
                {e.content}
              </div>
            ),
          }
        } else {
          const c = shouldJson(e.content) ?? e.content
          let content: ReactNode | null = null
          if (typeof c === 'string') {
            content = <div dangerouslySetInnerHTML={{ __html: md.render(c) }} />
          } else if (c?.images?.length) {
            content = (
              <div>
                <Image.PreviewGroup
                  items={c?.images?.map((img) => ({
                    src: handleImageUrl(img.image_url),
                    alt: img.alt || 'image',
                  }))}
                >
                  <Image
                    className="rounded overflow-hidden max-w-[200px]"
                    src={handleImageUrl(c?.images?.[0]?.image_url)}
                  />
                </Image.PreviewGroup>
              </div>
            )
          } else if (React.isValidElement(c)) {
            // 判断是否为 JSX.Element
            content = c
          }

          if (!content) {
            return null
          }

          return {
            role: 'ai',
            // avatar: {
            //   icon: <IconTanQi />,
            //   className: 'bg-ground-4',
            // },
            content,
            typing: true,
            loading: false,
          }
        }
      })
      .filter((e) => e !== null)
    if (aiState === 1) {
      return [
        ...items,
        {
          role: 'ai',
          // header: '檀棋',
          // avatar: {
          //   icon: <IconTanQi />,
          //   className: 'bg-ground-4',
          // },
          loading: true,
          loadingRender: () => (
            <IconLoading className="text-fore scale-150 translate-y-2" />
          ),
        },
      ]
    }
    return items
  }, [aiState, data])

  return (
    <Bubble.List
      autoScroll
      className="tanqi-chat flex-1 overflow-y-auto pl-3 pr-2 pt-2 pb-9"
      roles={roles}
      items={items}
    />
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
