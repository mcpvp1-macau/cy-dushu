import { makeToolbarRender } from '@/utils/antd/image'
import { GetProps, Image } from 'antd'

type PropsType = GetProps<typeof Image.PreviewGroup> & {
  boxRender?: (currentIndex: number) => React.ReactNode
}

const ImageContainBoxPreview: FC<PropsType> = memo((props) => {
  return (
    <Image.PreviewGroup
      {...props}
      preview={{
        // @ts-ignore
        ...(props.preview ?? {}),
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
                {props.boxRender?.(info.current)}
              </div>
            </div>
          )
        },
      }}
    />
  )
})

ImageContainBoxPreview.displayName = 'ImageContainBoxPreview'

export default ImageContainBoxPreview
