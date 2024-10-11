import { live } from '@/service/modules/device/device-video'
import Jessibuca from '../Video/Jessibuca'
import { formatTs } from '@/utils/time'
import IconButton from '../ui/button/IconButton'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'
import IconFull from '@/assets/icons/jsx/IconFull'
import {
  useDebounceEffect,
  useFullscreen,
  useSize,
  useThrottleFn,
} from 'ahooks'
import { ExpandOutlined, FullscreenExitOutlined } from '@ant-design/icons'
import { forwardRef, useImperativeHandle } from 'react'
import { calcStreamId } from '@/utils/video/stream'
import { getStreamQualityLevel } from '@/service/modules/video'
import VideoQuality5G from './VideoQuality5G'
import VideoQualityDRC from './VideoQualityDRC'
import { isNil } from 'lodash'
import SeiEnum, { SEI_TYPE } from '../Video/Jessibuca/sei-enum'
import SeiAIData from './SeiAIData'
import DrawBox from '../DrawBox'

type PropsType = {
  videoContainerId?: string
  productKey: string
  deviceId: string
  videoId: string
  // 需要决定位置传递 flex 的 order
  leftTop?: ReactNode
  leftBottom?: ReactNode
  rightTop?: ReactNode
  rightBottom?: ReactNode
  videoChildren?: ReactNode
  useVideoQualityCheck?: {
    open?: boolean
    valueDRC?: number | string
    onDRCChange?: (quality: string) => void
  }
  onAspectRatioChange?: (aspectRatio: number) => void
}

type DeviceLiveVideoRefType = {
  /**
   * 截图
   * @returns base64
   */
  snapshot: (mediaTypes?: string, quality?: any) => string
}

/** 设备直播 */
const DeviceLiveVideo = memo(
  forwardRef<DeviceLiveVideoRefType, PropsType>(
    (
      {
        videoContainerId,
        productKey,
        deviceId,
        videoId,
        leftBottom,
        leftTop,
        rightBottom,
        rightTop,
        videoChildren,
        useVideoQualityCheck,
        onAspectRatioChange,
      },
      ref,
    ) => {
      const queryClient = useQueryClient()
      const { data: playUrl } = useQuery(
        {
          queryKey: ['livePost', { productKey, deviceId, videoId }],
          queryFn: async () => {
            const { data } = await live(productKey, deviceId, { videoId })
            return data.playUrl + `?t=-1&token=-1&tt=${dayjs().valueOf()}`
          },
        },
        queryClient,
      )

      const [aspectRatio, setAspectRatio] = useState(16 / 9)
      const [ts, _setTs] = useState(0)
      const { run: setTs } = useThrottleFn(
        (t: number) => {
          _setTs(t)
        },
        { wait: 333 },
      )

      /** 刷新 */
      const handleRefresh = useMemoizedFn(() => {
        queryClient.invalidateQueries({
          queryKey: ['livePost', productKey, deviceId, videoId],
        })
      })

      const wrapperRef = useRef<HTMLDivElement>(null)
      const [fullScreen, { toggleFullscreen }] = useFullscreen(wrapperRef)
      const wrapperSize = useSize(wrapperRef)

      const videoBoxRef = useRef<HTMLDivElement>(null)
      const videoBoxSize = useSize(videoBoxRef)

      /** 截图 */
      const snapshot: DeviceLiveVideoRefType['snapshot'] = (
        type = 'image/jpeg',
        quality = 0.5,
      ) => {
        const video = wrapperRef.current?.querySelector('video')
        const canvaus = video
          ? document.createElement('canvas')
          : wrapperRef.current?.querySelector('canvas')
        if (!canvaus) {
          throw new Error('未找到视频或画布')
        }
        canvaus.width = video?.videoWidth ?? canvaus.width
        canvaus.height = video?.videoHeight ?? canvaus.height
        const ctx = canvaus.getContext('2d')
        if (!ctx) {
          throw new Error('未找到画布上下文')
        }
        ctx.drawImage(video ?? canvaus, 0, 0)
        return canvaus.toDataURL(type, quality)
      }

      useImperativeHandle(ref, () => ({
        snapshot,
      }))

      const streamId = useMemo(
        () => playUrl && calcStreamId(playUrl),
        [playUrl],
      )

      const { data: videoQuality } = useQuery(
        {
          queryKey: ['getLiveQuality', 'rtp', streamId],
          enabled: !!useVideoQualityCheck?.open && !!streamId,
          refetchInterval: 5_000,
          queryFn: () => getStreamQualityLevel({ app: 'rtp', streamId }),
          select: (d) => d.data.quality,
        },
        queryClient,
      )

      const [aiData, setAIData] = useState<
        SEI_TYPE[SeiEnum.Protobuf_SEI] | null
      >(null)

      const [enableScale, setEnableScale] = useState(0)
      const [scaleAspect, setScaleAspect] = useState(0)
      const [videoTranslate, setVideoTranslate] = useState([0, 0])
      const [tranformCss, setTransformCss] = useState('')
      const [scaleViewRect, setScaleViewRect] = useState<
        [number, number, number, number] | null
      >(null)
      const [scaleMulti, setScaleMulti] = useState(1)
      const handleDrewScaleEnd = (rect: [number, number, number, number]) => {
        setScaleViewRect(rect)
        setEnableScale(2)
      }

      useDebounceEffect(
        () => {
          if (enableScale !== 2 || !scaleViewRect) {
            return
          }
          const rectWidth =
            (scaleViewRect[2] - scaleViewRect[0]) * videoBoxSize!.width
          const rectHeight =
            (scaleViewRect[3] - scaleViewRect[1]) * videoBoxSize!.height
          setScaleAspect(rectWidth / rectHeight)
          setVideoTranslate([scaleViewRect[0], scaleViewRect[1]])
          const multi = Math.max(
            videoBoxSize!.width / rectWidth,
            videoBoxSize!.height / rectHeight,
          )
          setScaleMulti(multi)

          setTransformCss(
            `translate(${-scaleViewRect[0] * 100}%, ${
              -scaleViewRect[1] * 100
            }%)`,
          )

          setTimeout(() => {
            setTransformCss(
              `translate(${-scaleViewRect[0] * 100}%, ${
                -scaleViewRect[1] * 100
              }%) scale(${multi})`,
            )
          }, 200)
        },
        [scaleViewRect, wrapperSize, enableScale],
        { wait: 333 },
      )

      return (
        <div
          className="size-full overflow-hidden relative"
          ref={wrapperRef}
          style={{ aspectRatio: aspectRatio }}
        >
          <div
            className="absolute inset-0 m-auto max-w-full max-h-full"
            style={{
              aspectRatio: enableScale === 2 ? scaleAspect : aspectRatio,
            }}
          >
            {/* 视频内容 */}
            <div
              ref={videoBoxRef}
              className={clsx('absolute inset-0 bg-black')}
              style={{
                aspectRatio: aspectRatio,
                // transformOrigin: 'center',
                transformOrigin: `${videoTranslate[0] * 100}% ${
                  videoTranslate[1] * 100
                }%`,
                transform: enableScale === 2 ? tranformCss : undefined,
              }}
            >
              {playUrl && (
                <Jessibuca
                  containerId={videoContainerId}
                  src={playUrl}
                  onVideoInfo={(v) => {
                    setAspectRatio(v.width / v.height)
                    onAspectRatioChange?.(v.width / v.height)
                  }}
                  onTimeUpdate={setTs}
                  onSeiAIData={(aiData) => {
                    !aiData.ref && setAIData(aiData)
                  }}
                />
              )}

              {/* 视频绘制框 */}
              <div className="absolute inset-0 z-10">
                {aiData && <SeiAIData data={aiData} />}
                {enableScale === 1 && (
                  <DrawBox onDrawEnd={handleDrewScaleEnd} />
                )}
                {videoChildren}
              </div>
            </div>
          </div>
          {/* 上工具栏 */}
          {(leftTop || rightTop) && (
            <aside className="absolute top-0 left-0 right-0 bg-ground-100 bg-opacity-80 p-1 px-2 h-8 z-30 backdrop-blur-sm">
              <div className="flex justify-between items-center h-full">
                <section className="flex items-center gap-3">{leftTop}</section>
                <section className="flex items-center gap-3">
                  {rightTop}
                </section>
              </div>
            </aside>
          )}
          {/* 下工具栏 */}
          <aside className="absolute bottom-0 left-0 right-0 bg-ground-100 bg-opacity-80 p-1 px-2 h-8 z-30 backdrop-blur-sm">
            <div className="flex justify-between items-center h-full">
              <section className="flex items-center gap-3">
                <div className="order-10 text-fore text-xs">{formatTs(ts)}</div>
                {leftBottom}
              </section>
              <section className="flex items-center gap-3">
                {+videoQuality >= 0 && <VideoQuality5G value={videoQuality} />}
                {videoQuality == -1 &&
                  !isNil(useVideoQualityCheck?.valueDRC) && (
                    <VideoQualityDRC
                      value={useVideoQualityCheck.valueDRC}
                      onChange={useVideoQualityCheck?.onDRCChange}
                    />
                  )}
                <IconButton
                  toolTipProps={{
                    title: '刷新',
                    getPopupContainer: () =>
                      (document.fullscreenElement as HTMLElement) ??
                      document.body,
                  }}
                  className="order-20 text-[13px]"
                  onClick={handleRefresh}
                >
                  <IconRefresh />
                </IconButton>
                <IconButton
                  className="scale-90"
                  toolTipProps={{ title: '电子放大' }}
                  active={!!enableScale}
                  onClick={() => {
                    setEnableScale(1 - Math.sign(enableScale))
                  }}
                >
                  <ExpandOutlined />
                </IconButton>
                <IconButton
                  toolTipProps={{
                    title: !fullScreen ? '全屏' : '退出全屏',
                    align: {
                      offset: [-20, -10],
                    },
                    getPopupContainer: () =>
                      (document.fullscreenElement as HTMLElement) ??
                      document.body,
                  }}
                  className="order-10 text-[13px]"
                  onClick={toggleFullscreen}
                >
                  {!fullScreen ? <IconFull /> : <FullscreenExitOutlined />}
                </IconButton>
                {rightBottom}
              </section>
            </div>
          </aside>
        </div>
      )
    },
  ),
)

DeviceLiveVideo.displayName = 'DeviceLiveVideo'

export default DeviceLiveVideo
