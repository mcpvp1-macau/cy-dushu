import IconPlay from '@/assets/icons/jsx/IconPlay'
import { memo, ReactNode, type FC } from 'react'

type PropsType = {
  previewSrc: string
  size?: 'small' | 'middle' | 'large'
  info?: ReactNode
  onClick?: () => void
}

const VideoPreview: FC<PropsType> = memo(
  ({ previewSrc, info, size = 'large', onClick }) => {
    return (
      <div
        className="relative w-full aspect-video group rounded-[3px] overflow-hidden"
        onClick={onClick}
      >
        <img className="size-full object-cover" src={previewSrc} />
        <div className="absolute bottom-0 flex justify-center gap-0.5 py-0.5 text-xs bg-ground-100 bg-opacity-70 w-full z-10">
          {info}
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-ground-100 bg-opacity-50 cursor-pointer transition-opacity opacity-0 group-hover:opacity-100">
          <IconPlay
            className={clsx(
              'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-fore',
              {
                'text-4xl': size === 'large',
                'text-2xl': size === 'middle',
                'text-xl': size === 'small',
              },
            )}
          />
        </div>
      </div>
    )
  },
)

VideoPreview.displayName = 'VideoPreview'

export default VideoPreview
