import useVideoEncoderStore from '@/store/useVideoEncoder.store'
import JessibucaPro from '@/types/jessibuca-pro/jessibuca-pro'
import {
  supportMse,
  supportSimd,
  supportWCS,
  supportWCSHevc,
} from '@/utils/video/video-support'
import { useInterval } from 'ahooks'
import usePropertiesProtobuf from './hooks/usePropertiesProtobuf'
import SeiEnum, { SEI_TYPE } from './sei-enum'
import useProtobufSei from './hooks/useProtobufSei'
import useWebSocket from 'react-use-websocket'
import { heartbeat } from '@/constant/websocket'
import useUserStore from '@/store/useUser.store'
import useDeviceStats from './hooks/useDeviceStats'

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
  onError?: (err: Error) => void
  onStats?: (stats: any) => void
  onStreamEnd?: () => void
  /** 视频 Video 元素发生变化时 */
  onVideoElementChange?: (videoElement: HTMLVideoElement | null) => void
}

const Jessibuca: FC<PropsType> = memo(({ src, refreshKey, ...props }) => {
  const ref = useRef<HTMLDivElement>(null)

  const handleVideoDetect = useMemoizedFn(() => {
    const videoElement = ref.current?.querySelector('video')
    if (videoElementRef.current !== videoElement) {
      props.onVideoElementChange?.(videoElement ?? null)
    }
  })

  // 获取最新的 video 元素 ------------------------------------------------------
  const videoElementRef = useRef<HTMLVideoElement | null>(null)
  // useEffect(() => {
  //   if (!ref.current) {
  //     return
  //   }
  //   const ob = new MutationObserver(handleVideoDetect)
  //   ob.observe(ref.current!, {
  //     childList: true,
  //   })
  //   return () => {
  //     ob.disconnect()
  //   }
  // }, [ref, props.onVideoElementChange])

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
    handleVideoInfo(videoInfo)
  }, 2000)

  const { handlePropertiesProtobuf } = usePropertiesProtobuf(
    props.onSeiProperties,
  )
  const { handleProtobufSei } = useProtobufSei(props.onSeiAIData)

  const handleVideoSei = useMemoizedFn((b: Uint8Array) => {
    const n = b.length
    let flagNum = 0
    for (let i = 0; i < n - 8; ) {
      const flag = (b[i] << 16) | (b[i + 1] << 8) | b[i + 2]
      if (flag !== 0xabcdef) {
        i++
        continue
      }
      flagNum += 1
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
    // TODO 适配没有标志位的普通sei，后续拿掉
    if (flagNum === 0) {
      const decoder = new TextDecoder()
      const str = decoder.decode(b)
      const start = [...str].findIndex((item) => item === '{')
      const end = [...str].findLastIndex((item) => item === '}')
      const sei = [...str].filter((s, i) => i >= start && i <= end).join('')
      let seiJson: any = {}
      try {
        seiJson = JSON.parse(sei)
      } catch (error) {}
      if (seiJson.object_list?.length) {
        // dataRef.current.push({ ts: value.ts, data: seiJson });
        props.onSeiAIData?.({
          batchId: seiJson.batch_id,
          frameMum: seiJson.frame_mum,
          displayMetaList: seiJson.display_meta_list,
          frameTensorList: seiJson.frame_tensor_list,
          imagePath: seiJson.image_path,
          inferDone: seiJson.infer_done,
          ntpTimestamp: seiJson.ntp_timestamp,
          recordPath: seiJson.record_path,
          objectList: seiJson.object_list.map((item) => {
            return {
              ...item,
              bboxHeight: item.bbox_height,
              bboxLeft: item.bbox_left,
              bboxTop: item.bbox_top,
              bboxWidth: item.bbox_width,
              classId: item.class_id,
              imagePath: item.image_path,
              inferId: item.infer_id,
              objLabelList: item.objLabelList,
              objTensorList: item.objTensorList,
              objectId: item.object_id,
              objectLabel: item.object_label,
              objectSubLabel: item.object_sub_label,
              radarTargetId: item.radar_target_id,
              radarDeviceId: item.radar_device_id,
              videoTime: item.video_time,
              sourceType: item.source_type,
              objPayloadList: item.obj_payload_list,
              labelId: item.label_id,
            }
          }),
          seq: seiJson.seq,
          pts: seiJson.pts,
          sourceFrameHeight: seiJson.source_frame_height,
          sourceFrameWidth: seiJson.source_frame_width,
          sourceId: seiJson.source_id,
          videoInferDone: seiJson.video_infer_done,
          productKey: seiJson.product_key,
          deviceId: seiJson.device_id,
          videoPath: seiJson.video_path,
          ref: seiJson.ref,
          userMeta: seiJson.user_meta,
        })
      }
    }
  })

  const openTime = useRef(Date.now())
  const metricsURL = useMemo(() => {
    const index = src.indexOf('/rtp')
    const flvIndex = src.indexOf('.flv')

    if (index === -1 || flvIndex === -1) {
      return null
    }

    const metricsURL = `${src.slice(0, index)}/metrics?stream_id=${src.slice(
      index + '/rtp/'.length,
      flvIndex,
    )}&client_id=${useUserStore.getState().user?.username ?? ''}_${dayjs(
      openTime.current,
    ).format('YYMMDD_HHmm_ssSSS')}`
    return metricsURL
  }, [src])

  const deviceStatus = useDeviceStats()

  const { sendJsonMessage, sendMessage } = useWebSocket(
    metricsURL,
    {
      heartbeat,
      reconnectAttempts: 0x3f3f3f3f,
      retryOnError: true,
      reconnectInterval: 5_000,
      shouldReconnect: () => true,
      onOpen: () => {
        sendMessage('ping')
      },
    },
    true,
  )

  const handleStats = (stats) => {
    sendJsonMessage(Object.assign(stats, deviceStatus))
  }

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
      heartTimeoutReplayUseLastFrameShow: true,
      replayUseLastFrameShow: true,
      audioEngine: 'worklet',
      isNotMute: false,
      heartTimeout: 300,
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
        props.onError?.(err)
      },
    )

    jessibucaRef.current.on(
      'fetchError' as JessibucaPro.ERROR.fetchError,
      () => {
        console.error('jessibuca fetch error')
        props.onFetchError?.()
      },
    )

    jessibucaRef.current.on('stats' as JessibucaPro.EVENTS.stats, handleStats)

    jessibucaRef.current.on(
      'streamEnd' as JessibucaPro.EVENTS.streamEnd,
      () => {
        props.onStreamEnd?.()
      },
    )

    jessibucaRef.current.on(
      'start' as JessibucaPro.EVENTS.start,
      handleVideoDetect,
    )

    return () => {
      jessibucaRef.current?.destroy()
      jessibucaRef.current = null
    }
  }, [videoEncoderValue])

  // 视频地址变化时，重新播放
  useEffect(() => {
    if (!jessibucaRef.current) {
      return
    }
    jessibucaRef.current.clearBufferDelay()
    jessibucaRef.current.playbackClearCacheBuffer()
    if (!src) {
      return
    }
    jessibucaRef.current.play(src)
  }, [src, refreshKey])

  // useInterval(() => {
  //   if (!jessibucaRef.current) {
  //     return
  //   }
  //   jessibucaRef.current?.sendWebsocketMessage?.('ping')
  // }, 3000)

  return <div id={props.containerId} ref={ref} key={videoEncoderValue}></div>
})

export default Jessibuca
