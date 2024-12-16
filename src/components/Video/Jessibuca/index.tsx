import useVideoEncoderStore from '@/store/useVideoEncoder.store'
import JessibucaPro from '@/types/jessibuca-pro/jessibuca-pro'
import {
  supportMse,
  supportSimd,
  supportWCS,
  supportWCSHevc,
} from '@/utils/video/video-support'
import { useInterval, useThrottleEffect } from 'ahooks'
import usePropertiesProtobuf from './hooks/usePropertiesProtobuf'
import SeiEnum, { SEI_TYPE } from './sei-enum'
import useProtobufSei from './hooks/useProtobufSei'
import useWebSocket from 'react-use-websocket'
import { heartbeat } from '@/constant/websocket'
import useUserStore from '@/store/useUser.store'

type VideoInfo = {
  width: number
  height: number
  encType: string
  encTypeCode: number
}

type PropsType = {
  containerId?: string
  src: string
  refreshKey?: React.Key
  /** 视频信息回调 */
  onVideoInfo?: (info: VideoInfo) => void
  /** 时间持续更新回调 */
  onTimeUpdate?: (ts: number) => void
  onSeiProperties?: (data: SEI_TYPE[SeiEnum.JSON_PROPERTIES]) => void
  onSeiAIData?: (data: SEI_TYPE[SeiEnum.Protobuf_SEI]) => void
  onFetchError?: () => void
  onStats?: (stats: any) => void
}

const Jessibuca: FC<PropsType> = memo(({ src, refreshKey, ...props }) => {
  const ref = useRef<HTMLDivElement>(null)
  const jessibucaRef = useRef<JessibucaPro | null>(null)

  const videoEncoderValue = useVideoEncoderStore((s) => s.videoEncoderValue)
  videoEncoderValue

  const lastVideoInfo = useRef<Partial<VideoInfo>>({})
  const handleVideoInfo = useMemoizedFn((data) => {
    props.onVideoInfo?.(data)
    lastVideoInfo.current = data
  })

  const handleTimeUpdate = useMemoizedFn((ts: number) => {
    props.onTimeUpdate?.(ts)
  })

  useInterval(() => {
    const videoInfo = jessibucaRef.current?.getVideoInfo() as VideoInfo
    if (!videoInfo) {
      return
    }
    // if (
    //   videoInfo.width !== lastVideoInfo.current.width ||
    //   videoInfo.height !== lastVideoInfo.current.height
    // ) {
    handleVideoInfo(videoInfo)
    // }
  }, 2000)

  const { handlePropertiesProtobuf } = usePropertiesProtobuf(
    props.onSeiProperties,
  )
  const { handleProtobufSei } = useProtobufSei(props.onSeiAIData)

  const handleVideoSei = useMemoizedFn((b: Uint8Array) => {
    const n = b.length
    for (let i = 0; i < n - 8; ) {
      const flag = (b[i] << 16) | (b[i + 1] << 8) | b[i + 2]
      if (flag !== 0xabcdef) {
        i++
        continue
      }
      const type = b[i + 3]
      const length =
        b[i + 4] | (b[i + 5] << 8) | (b[i + 6] << 16) | (b[i + 7] << 24)
      const dataBytes = b.slice(i + 8, i + 8 + length)
      switch (type) {
        case SeiEnum.JSON_SEI: // 普通文本数据
          break
        case SeiEnum.Protobuf_SEI: // protobuf sei
          handleProtobufSei(dataBytes)
          break
        case SeiEnum.PROTOBUF_PROPERTIES: // protobuf 属性
          handlePropertiesProtobuf(dataBytes)
          break
      }
      i += 8 + length
    }
  })

  const metricsURL = useMemo(() => {
    const index = src.indexOf('/rtp')
    if (index === -1) {
      return null
    }
    const metricsURL = src.slice(0, index) + '/metrics'
    return metricsURL
  }, [src])

  const { sendJsonMessage } = useWebSocket(metricsURL, {
    heartbeat,
    reconnectAttempts: 0x3f3f3f3f,
    retryOnError: true,
    reconnectInterval: 5_000,
    shouldReconnect: () => true,
  })

  const openTime = useRef(Date.now())
  const handleStats = useMemoizedFn((stats) => {
    stats.url = src
    stats.id = `${useUserStore.getState().user?.username ?? ''}:${
      openTime.current
    }`
    sendJsonMessage(stats)
  })

  // 创建播放器
  useEffect(() => {
    const support: Record<string, boolean> = {
      useMSE: false,
      useSIMD: false,
      useWCS: false,
      useWasm: false,
    }
    if (videoEncoderValue) {
      support[videoEncoderValue] = true
    } else if (supportWCS && supportWCSHevc) {
      support.useWCS = true
    } else if (supportMse) {
      support.useMSE = true
    } else if (supportSimd) {
      support.useSIMD = true
    } else {
      support.useWasm = true
    }

    jessibucaRef.current = new window.JessibucaPro({
      container: ref.current!,
      videoBuffer: globalConfig.videoBuffer || 0, // 缓存时长
      videoBufferDelay: globalConfig.videoBufferDelay || 0, // 1000s
      isResize: false,
      // text: '',
      loadingText: '',
      debugLevel: 'debug',
      ...support,
      operateBtns: {},
      timeout: 5000,
      heartTimeoutReplayUseLastFrameShow: false,
      audioEngine: 'worklet',
      isNotMute: false,
      heartTimeout: 10,
      ptzClickType: 'mouseDownAndUp',
      forceNoOffscreen: true,
      useCanvasRender: false,
      // useWebGPU: true,
      debug: false,
      isFullResize: false,
      isEmitSEI: true,
      decoder: '/js/JessibucaPro/decoder-pro.js',
      // supportHls265: true,
      // supportDblclickFullscreen: true,
      // decoderAudio: 'js/JessibucaPro/decoder-pro-audio.js',
      /** @ts-ignore */
      // decoderHard: '/js/JessibucaPro/decoder-pro-hard.js',
    })

    jessibucaRef.current.on(
      'videoInfo' as JessibucaPro.EVENTS.videoInfo,
      handleVideoInfo,
    )
    jessibucaRef.current.on(
      'timeUpdate' as JessibucaPro.EVENTS.timeUpdate,
      handleTimeUpdate,
    )

    jessibucaRef.current.on(
      'videoSEI' as JessibucaPro.EVENTS.videoSEI,
      ({ data }) => {
        handleVideoSei(data)
      },
    )

    jessibucaRef.current.on(
      'error' as JessibucaPro.EVENTS.error,
      (err: Error) => {
        console.error('jessibuca error', err)
      },
    )

    jessibucaRef.current.on(
      'fetchError' as JessibucaPro.ERROR.fetchError,
      () => {
        props.onFetchError?.()
      },
    )

    jessibucaRef.current.on('stats' as JessibucaPro.EVENTS.stats, handleStats)

    return () => {
      jessibucaRef.current?.destroy()
      jessibucaRef.current = null
    }
  }, [videoEncoderValue])

  // 视频地址变化时，重新播放
  useThrottleEffect(
    () => {
      if (!jessibucaRef.current) {
        return
      }
      jessibucaRef.current.clearBufferDelay()
      jessibucaRef.current.playbackClearCacheBuffer()
      if (!src) {
        return
      }
      jessibucaRef.current.play(src)
    },
    [src, refreshKey],
    { wait: 500, trailing: false },
  )

  return <div id={props.containerId} ref={ref} key={videoEncoderValue}></div>
})

export default Jessibuca
