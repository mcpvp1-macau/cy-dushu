import useVideoEncoderStore from '@/store/useVideoEncoder.store'
import JessibucaPro from '@/types/jessibuca-pro/jessibuca-pro'
import {
  supportMse,
  supportSimd,
  supportWCS,
  supportWCSHevc,
} from '@/utils/video/video-support'
import { type FC } from 'react'

type PropsType = {
  src: string
}

const Video: FC<PropsType> = ({ src }) => {
  const ref = useRef<HTMLDivElement>(null)
  const jessibucaRef = useRef<JessibucaPro | null>(null)

  const videoEncoderValue = useVideoEncoderStore((s) => s.videoEncoderValue)

  // 创建播放器
  useEffect(() => {
    const support: { [key: string]: boolean } = {
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
      support.useMSE = true /*  */
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
      audioEngine: 'worklet',
      isNotMute: false,
      heartTimeout: 10,
      ptzClickType: 'mouseDownAndUp',
      forceNoOffscreen: true,
      useCanvasRender: false,
      // useWebGPU: true,
      isEmitSEI: true,
      decoder: 'js/JessibucaPro/decoder-pro.js',
      // decoderAudio: 'js/JessibucaPro/decoder-pro-audio.js',
      // decoderHard: 'js/JessibucaPro/decoder-pro-hard.js',
      supportHls265: true,
    })

    return () => {
      jessibucaRef.current?.destroy()
    }
  }, [])

  // 视频地址变化时，重新播放
  useEffect(() => {
    if (!jessibucaRef.current) {
      return
    }
    jessibucaRef.current.play(src)
  }, [src])

  return <div ref={ref} />
}

export default Video
