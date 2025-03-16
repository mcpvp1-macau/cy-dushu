import { makeToolbarRender } from '@/utils/antd/image'
import { Image } from 'antd'
import { ReactNode } from 'react'

type PropsType = {
  children: ReactNode
  src: string
  alt?: string
  sourceWidth: number
  sourceHeight: number
}

/** 大小由父元素决定 */
const ImageContainBoxPreview: FC<PropsType> = memo((props) => {
  return (
    <>
      <div
        className="absolute inset-0 m-auto z-10 pointer-events-none max-w-full max-h-full"
        style={{
          aspectRatio: props.sourceWidth / props.sourceHeight,
        }}
      >
        {props.children}
      </div>
      <Image
        className="size-full object-contain"
        rootClassName="size-full"
        width="100%"
        height="100%"
        src={props.src}
        alt={props.alt}
        preview={{
          minScale: 0.5,
          toolbarRender: makeToolbarRender(1, 50),
          imageRender: (originalNode, info) => {
            const t = info.transform
            const fx = t.flipX ? -1 : 1
            const fy = t.flipY ? -1 : 1
            return (
              <div className="relative">
                {originalNode}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    transform: `translate3d(${t.x}px, ${t.y}px, 0px) scale3d(${
                      t.scale * fx
                    },${t.scale * fy},1) rotate(${t.rotate}deg)`,
                    transition:
                      'transform var(--ant-motion-duration-slow) var(--ant-motion-ease-out) 0s',
                  }}
                >
                  {props.children}
                </div>
              </div>
            )
          },
          toolbarRender: makeToolbarRender(0.5, 50),
        }}
      />
    </>
  )
})

ImageContainBoxPreview.displayName = 'ImageContainBoxPreview'

export default ImageContainBoxPreview
