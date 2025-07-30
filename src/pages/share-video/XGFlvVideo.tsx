import { forwardRef, useImperativeHandle } from 'react'
import Player, { Events } from 'xgplayer'
import FlvPlugin from 'xgplayer-flv'
import 'xgplayer/dist/index.min.css'

export type VideoInfoEvent = {
  duration: number
  width: number
  height: number
}

export type TimeUpdateEvent = {
  position: number
  duration: number
}

export type PlayEvent = {
  type: string
}

export type PauseOrBufferEvent = {
  type: string
}

export type ErrorEvent = {
  type: string
}

type PropsType = {
  src: string
  autostart?: boolean
  onVideoInfo?: (event: VideoInfoEvent) => void
  onTimeUpdate?: (event: TimeUpdateEvent) => void
  onPlay?: (event: PlayEvent) => void
  onPause?: (event: PauseOrBufferEvent) => void
  onBuffer?: (event: PauseOrBufferEvent) => void
  onError?: (event: ErrorEvent) => void
}

type CyberPlayerRef = {
  play: () => void
  pause: () => void
  seek: (position: number) => void
  /** event 有 ready, setupError, playlist, playlistItem, playlistComplete, bufferChange, play, pause, buffer, idle, complete, error, seek, seeked, time, mute, volume, fullscreen, resize, levels, levelsChanged, captionsList, captionsChange, controls, displayClick, meta，performanceInfo, hls_level_updated,rtcEvent,sei_parsed 等  */
  on: (event: string, callback: (event: any) => void) => void
  player: any
  setPlaybackRate: (rate: number) => void
}

const XGFlvVideo = memo(
  forwardRef<CyberPlayerRef, PropsType>((props, ref) => {
    const elRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<Player | null>(null)
    const [error, setError] = useState(false)
    useImperativeHandle(ref, () => ({
      play: () => playerRef.current?.play(),
      pause: () => playerRef.current?.pause(),
      seek: (position) => {
        if (playerRef.current) {
          // playerRef.current.currentTime = position
          playerRef.current.seek(position, 'auto')
        }
      },
      resize: () => playerRef.current?.resize(),
      on: (event, callback) => playerRef.current?.on(event, callback),
      player: playerRef.current,
      setPlaybackRate: (rate: number) => {
        if (playerRef.current) {
          playerRef.current.playbackRate = rate
        }
      },
    }))

    useEffect(() => {
      if (!elRef.current) {
        return
      }
      const isFlv = props.src.includes('.flv')
      const player = new Player({
        el: elRef.current,
        url: props.src,
        videoInit: true,
        width: '100%',
        height: '100%',
        defaultMuted: true,
        plugins: [isFlv ? FlvPlugin : null],
        autoplay: props.autostart ?? true,
        autoplayMuted: true,
        defaultPlaybackRate: 1,
        download: true,
        controls: false,
        keyShortcut: false,
      })

      playerRef.current = player

      player.on(Events.LOADED_DATA, () => {
        setTimeout(() => player.resize())
        props.onVideoInfo?.({
          duration: player.duration,

          // @ts-ignore
          width: player._videoWidth,
          // @ts-ignore
          height: player._videoHeight,
        })
      })
      player.on(Events.PLAY, () => {
        props.onPlay?.({
          type: 'play',
        })
      })
      player.on(Events.TIME_UPDATE, (e: TimeUpdateEvent) => {
        props.onTimeUpdate?.({
          position: player.currentTime,
          duration: player.duration,
        })
      })
      player.on(Events.PAUSE, (e: PauseOrBufferEvent) => {
        props.onPause?.(e)
      })
      player.on(Events.PLAYING, (e: PauseOrBufferEvent) => {
        props.onBuffer?.({
          type: 'play',
        })
        setError(false)
      })
      // player.on(Events.SEEKING, (e: PauseOrBufferEvent) => {
      //   props.onBuffer?.({
      //     type: 'buffer',
      //   })
      // })
      player.on(Events.WAITING, (e: PauseOrBufferEvent) => {
        props.onBuffer?.({
          type: 'buffer',
        })
      })

      player.on(Events.ERROR, (e) => {
        if (e.errorCode === 5103 || e.mediaError.code === 3) {
          // 解码错误
          setError(true)
          //   player.seek(player.currentTime + 1, 'auto');
          //   player.retry()
          props.onError?.({
            type: 'error',
          })
        } else {
          console.log('error222', e)
        }
      })

      return () => {
        playerRef.current?.destroy()
      }
    }, [props.src])

    return (
      <div ref={elRef}>
        {error && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div>
              <div className="text-white text-center">解码异常</div>
              <div className="text-white text-center">请尝试下载观看</div>
            </div>
          </div>
        )}
      </div>
    )
  }),
)

XGFlvVideo.displayName = 'XGFlvVideo'

export default XGFlvVideo
