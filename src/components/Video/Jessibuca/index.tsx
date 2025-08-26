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
import './index.less'
import Metrics from './Metrics'

const SEND_PING_INTERVAL = 1000
const WS_TIMEOUT = 3000

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
  onSeiAIData?: (data: SEI_TYPE[SeiEnum.Protobuf_SEI] | null) => void
  onFetchError?: () => void
  onError?: (err: Error) => void
  onStats?: (stats: any) => void
  onTimeout?: () => void
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

  const jessibucaRef = useRef<JessibucaPro | null>(null)
  const [jessibucaInstance, setJessibucaInstance] =
    useState<JessibucaPro | null>(null)

  const videoEncoderValue = useVideoEncoderStore((s) => s.videoEncoderValue)

  const dataRef = useRef<any>([])

  const lastRef = useRef(0)

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

  const [ping, setPing] = useState(0)

  const lastMsgTime = useRef(0)

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
      debugLevel: 'warn',
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
      playFailedAndReplay: true,
      playFailedUseLastFrameShow: true,
      backgroundLoadingShow: true,
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
      ({ data, ts }) => {
        // handleVideoSei(data)
        dataRef.current.push({ ts: ts, data: data })
      },
    )

    jessibucaRef.current.on('currentPts', (ts) => {
      const data = dataRef.current.findLast((d: any) => d.ts <= ts) || null
      if (data) {
        lastRef.current = 0
        handleVideoSei?.(data?.data)
      } else if (!lastRef.current) {
        // 如果已经清空，则不必触发
        // 清空画框
        lastRef.current += 1
        if (lastRef.current > 8) {
          props.onSeiAIData?.(null)
        }
        // props.onSeiAIData?.(null)
      }

      while (dataRef.current?.[0]?.ts <= ts) {
        dataRef.current.shift()
      }
    })

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

    jessibucaRef.current.on(
      'streamEnd' as JessibucaPro.EVENTS.streamEnd,
      () => {
        console.log('streamEnd')
        props.onStreamEnd?.()
      },
    )

    jessibucaRef.current.on('timeout' as JessibucaPro.EVENTS.timeout, () => {
      console.log('timeout')
      props.onTimeout?.()
    })

    jessibucaRef.current.on(
      'start' as JessibucaPro.EVENTS.start,
      handleVideoDetect,
    )

    // 检查是否无数据返回, 主要用于检查 ping pong
    jessibucaRef.current.on('websocketMessage', () => {
      const now = Date.now()
      setPing(0)
      lastMsgTime.current = now
    })

    setJessibucaInstance(jessibucaRef.current)

    return () => {
      jessibucaRef.current?.destroy()
      jessibucaRef.current = null
      setJessibucaInstance(null)
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
    jessibucaRef.current.play(`${src}&ttt=${Date.now()}`).then(() => {
      lastMsgTime.current = Date.now()
    })
  }, [src, refreshKey, ping])

  // 定时发送 ping
  useInterval(() => {
    if (!jessibucaRef.current) {
      return
    }
    const now = Date.now()
    if (lastMsgTime.current > 0 && now - lastMsgTime.current > WS_TIMEOUT) {
      setPing(1)
    }
    jessibucaRef.current?.sendWebsocketMessage?.('ping')
  }, SEND_PING_INTERVAL)

  return (
    <>
      <div id={props.containerId} ref={ref} key={videoEncoderValue}></div>
      {globalConfig.enableJessibucaMetrics && jessibucaInstance && (
        <Metrics jessibuca={jessibucaInstance} src={src} openTime={openTime} />
      )}
    </>
  )
})

export default Jessibuca
