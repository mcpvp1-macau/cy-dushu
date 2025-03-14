import AppSpin from '@/components/AppSpin'
import { useAsyncEffect } from 'ahooks'
import { forwardRef, useImperativeHandle } from 'react'

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
  newstate: string
  oldstate: string
  reason: string
  playReason: string
}

export type PauseOrBufferEvent = {
  type: string
  newstate: string
  oldstate: string
  reason: string
}

type PropsType = {
  src: string
  autostart?: boolean;
  onVideoInfo?: (event: VideoInfoEvent) => void
  onTimeUpdate?: (event: TimeUpdateEvent) => void
  onPlay?: (event: PlayEvent) => void
  onPause?: (event: PauseOrBufferEvent) => void
  onBuffer?: (event: PauseOrBufferEvent) => void
}

type CyberPlayerRef = {
  play: () => void
  pause: () => void
  stop: () => void
  seek: (position: number) => void
  getDuration: () => number
  getState: () => 'playing' | 'paused' | 'idle' | 'buffering'
  /** event 有 ready, setupError, playlist, playlistItem, playlistComplete, bufferChange, play, pause, buffer, idle, complete, error, seek, seeked, time, mute, volume, fullscreen, resize, levels, levelsChanged, captionsList, captionsChange, controls, displayClick, meta，performanceInfo, hls_level_updated,rtcEvent,sei_parsed 等  */
  on: (event: string, callback: (event: any) => void) => void
  player: any
}

const CyberPlayer = memo(
  forwardRef<CyberPlayerRef, PropsType>((props, ref) => {
    const playerRef = useRef<Record<string, any> | null>(null)

    const playTimer = useRef<NodeJS.Timeout | null>(null)
    useImperativeHandle(ref, () => ({
      play: () => playerRef.current?.play(),
      pause: () => playerRef.current?.pause(),
      stop: () => {
        playTimer.current = setTimeout(() => playerRef.current?.stop(), 500)
      },
      seek: (position) => playerRef.current?.seek(position),
      getState: () => playerRef.current?.getState(),
      getDuration: () => playerRef.current?.getDuration(),
      resize: () => playerRef.current?.resize(),
      on: (event, callback) => playerRef.current?.on(event, callback),
      player: playerRef.current,
    }))

    const [loaded, setLoaded] = useState(!!window?.cyberplayer)

    useEffect(() => {
      if (!loaded) {
        return
      }
      const player = window.cyberplayer('cyber-player').setup({
        title: 'h265点播播放',
        width: '100%',
        height: '100%',
        autostart: props.autostart ?? true,
        stretching: 'uniform',
        repeat: false,
        volume: 100,
        controls: false,
        file: props.src,
      })
      playerRef.current = player

      player.onMeta((e: VideoInfoEvent) => {
        setTimeout(() => player.resize('100%', '100%'))
        props.onVideoInfo?.(e)
      })
      player.onPlay(props.onPlay)
      player.onTime(props.onTimeUpdate)
      player.onPause(props.onPause)
      player.onBuffer(props.onBuffer)

      return () => {
        playerRef.current?.remove()
        clearTimeout(playTimer.current!)
      }
    }, [props.src, loaded])

    useAsyncEffect(async () => {
      if (loaded) {
        return
      }
      try {
        await loadCyberPlayer()
        setLoaded(true)
      } catch (e) {
        console.error('load cyberplayer failed')
      }
    }, [])

    if (!loaded) {
      return <AppSpin />
    }

    return <div id="cyber-player" />
  }),
)

CyberPlayer.displayName = 'CyberPlayer'

export default CyberPlayer

// 加载 cyberplayer
const loadCyberPlayer = async () => {
  return new Promise<void>((resolve, reject) => {
    if (window.cyberplayer) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = '/js/cyberplayer/cyberplayer.js'
    document.body.appendChild(script)
    script.onload = () => {
      script.remove()
      resolve()
    }
    script.onerror = () => {
      script.remove()
      reject('load cyberplayer failed')
    }
  })
}
