import IconPlay from '@/assets/icons/jsx/IconPlay'
import { memo, ReactNode, type FC } from 'react'
import { useEffect } from 'react'
import Player from 'xgplayer'
import HlsPlugin from 'xgplayer-hls'

type PropsType = {
  previewSrc: string
  size?: 'small' | 'middle' | 'large'
  info?: ReactNode
  onClick?: () => void
  isAutoSrc?: boolean // 是否自动获取视频源封面
  videoUrl?: string // 视频源地址
}

const VideoPreview: FC<PropsType> = memo(
  ({ previewSrc, info, size = 'large', onClick, isAutoSrc, videoUrl }) => {
    const [error, setError] = useState(false)
    useEffect(() => {
      if (isAutoSrc && videoUrl) {
        const isHls = videoUrl.includes('.m3u8')
        const player = new Player({
          id: videoUrl,
          url: videoUrl,
          videoInit: true,
          width: '100%',
          height: '100%',
          muted: true,
          plugins: [isHls ? HlsPlugin : null],
          autoplayMuted: true,
          autoplay: false,
          controls: false,
        })

        player.on('error', (e) => {
          if (e.errorCode === 5103) {
            // 解码错误
            setError(true)
          } else {
            console.log('error222', e)
          }
        })

        return () => {
          player.destroy()
        }
      }
    }, [isAutoSrc, videoUrl])


    return (
      <div
        className="relative w-full aspect-video group rounded-[3px] overflow-hidden"
        onClick={onClick}
      >
        {error ? (
          <>
            <div className="bg-[#28323C] pt-1 w-full h-full flex justify-center text-[10px]">
              解码失败
              <br /> 请尝试下载观看
            </div>
          </>
        ) : (
          <></>
        )}
        <>
          {isAutoSrc ? (
            <div
              id={videoUrl}
              className="video-preview-img"
              style={{ display: error ? 'none' : 'block' }}
            ></div>
          ) : (
            <img className="size-full object-cover" src={previewSrc} />
          )}
        </>

        <div className="absolute bottom-0 flex justify-center gap-0.5 py-0.5 text-xs bg-ground-1 bg-opacity-70 w-full z-10">
          {info}
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-ground-1 bg-opacity-50 cursor-pointer transition-opacity opacity-0 group-hover:opacity-100">
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
