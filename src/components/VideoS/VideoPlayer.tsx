import { ComponentRef, memo, ReactNode, type FC } from 'react'
import CyberPlayer, {
  TimeUpdateEvent,
  VideoInfoEvent,
} from '../Video/CyberPlayer'
import IconButton from '../ui/button/IconButton'
import IconPlay from '@/assets/icons/jsx/IconPlay'
import IconPause from '@/assets/icons/jsx/IconPause'
import { Slider, Spin } from 'antd'
import { formatSecMMSS } from '@/utils/time'

type PropsType = {
  src: string
  rightTools?: ReactNode
}

const VideoPlayer: FC<PropsType> = memo(({ src, rightTools }) => {
  const [isPlaying, setIsPlaying] = useState(true)

  const playerRef = useRef<ComponentRef<typeof CyberPlayer>>(null)
  const [buffering, setBuffering] = useState(true)

  const handlePlay = useMemoizedFn(() => {
    playerRef.current?.play()
  })

  const handlePause = useMemoizedFn(() => {
    playerRef.current?.pause()
  })

  const [aspectRatio, setAspectRatio] = useState(16 / 9)
  const [duration, setDuration] = useState(0)
  const handleVideoInfo = useMemoizedFn((e: VideoInfoEvent) => {
    setAspectRatio(e.width / e.height)
    setDuration(e.duration)
  })

  const [currentPosition, setCurrentPosition] = useState(0)
  const handleTimeUpdate = useMemoizedFn((e: TimeUpdateEvent) => {
    if (skipTimeEventRef.current) {
      return
    }
    setCurrentPosition(e.position)
  })

  const handlePlayerStateChange = useMemoizedFn(({ type }: any) => {
    if (type === 'buffer') {
      setBuffering(true)
      return
    }
    setBuffering(false)
    setIsPlaying(type === 'play')
  })

  const skipTimeEventRef = useRef(false)
  const handleSliderChange = useMemoizedFn((value: number) => {
    skipTimeEventRef.current = true
    setCurrentPosition(value)
  })
  const handleSliderChangeComplete = useMemoizedFn((value: number) => {
    skipTimeEventRef.current = false
    playerRef.current?.seek(value)
  })

  const [mouseIn, setMouseIn] = useState(false)

  return (
    <div
      className="w-full relative"
      style={{ aspectRatio }}
      onMouseEnter={() => setMouseIn(true)}
      onMouseLeave={() => setMouseIn(false)}
    >
      <div className="absolute inset-0">
        <CyberPlayer
          ref={playerRef}
          src={src}
          onVideoInfo={handleVideoInfo}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlayerStateChange}
          onPause={handlePlayerStateChange}
          onBuffer={handlePlayerStateChange}
        />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
        <Spin spinning={buffering} size="large" />
      </div>

      <aside
        className={clsx(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t  bg-opacity-80  p-1 px-3 transition-opacity duration-500',
          'from-neutral-950 from-0% to-[100%]',
          {
            'opacity-0': !mouseIn,
          },
        )}
      >
        <div className="flex gap-3 items-center">
          <div>
            {!isPlaying ? (
              <IconButton onClick={handlePlay}>
                <IconPlay />
              </IconButton>
            ) : (
              <IconButton onClick={handlePause}>
                <IconPause />
              </IconButton>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span>{formatSecMMSS(currentPosition)}</span>-
            <span>{formatSecMMSS(duration)}</span>
          </div>
          <div className="flex-1">
            <Slider
              max={duration}
              min={0}
              value={currentPosition}
              tooltip={{ formatter: formatSecMMSS }}
              onChange={handleSliderChange}
              onChangeComplete={handleSliderChangeComplete}
            />
          </div>
          {rightTools}
        </div>
      </aside>
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer
