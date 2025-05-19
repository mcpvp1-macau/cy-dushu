import {
  getDeviceStreamList,
  live,
  setLiveQuality,
} from '@/service/modules/device/device-video'
import Jessibuca from '../Video/Jessibuca'
import { formatTs } from '@/utils/time'
import IconButton from '../ui/button/IconButton'
import IconRefresh from '@/assets/icons/jsx/IconRefresh'
import IconFull from '@/assets/icons/jsx/IconFull'
import { useDebounceFn, useFullscreen, useSize, useThrottleFn } from 'ahooks'
import { ExpandOutlined, FullscreenExitOutlined } from '@ant-design/icons'
import { forwardRef, useImperativeHandle } from 'react'
import { calcStreamId } from '@/utils/video/stream'
import { getStreamQualityLevel } from '@/service/modules/video'
import VideoQuality5G from './components/VideoQuality5G'
import VideoQualityDRC from './components/VideoQualityDRC'
import { isNil } from 'lodash'
import SeiAIData from './components/SeiAIData'
import DrawBox from '../DrawBox'
import useElectricScale from './hooks/useElectricScale'
import { PropertiesData } from '../Video/Jessibuca/sei-types/properties'
import VideoStream from './components/VideoStream'
import { ConfigProvider } from 'antd'
import useCalcSafeArea from './hooks/useCalcSafeArea'
import VideoDing from './components/VideoDing'
import { AiObject } from '../Video/Jessibuca/sei-types/ai-data'
import useAIDataState from './hooks/useAIDataState'
import DaoTongPlayer from '../Video/DaoTongPlayer'
import SeiAIDataMetaInfo from './components/SeiAIDataMetaInfo'

type PropsType = {
  videoContainerId?: string
  productKey: string
  deviceId: string
  videoId: string
  sn?: string
  useTopBar?: boolean
  useBottomBar?: boolean
  // 需要决定位置传递 flex 的 order
  leftTop?: ReactNode
  leftBottom?: ReactNode
  rightTop?: ReactNode
  rightBottom?: ReactNode
  videoChildren?: ReactNode
  /** 区别于 videoChildren, 内容不会被工具栏挡住, 例如视频画框等操作请不要在这, 百分比是不对的 */
  videoSafeAreaChildren?: ReactNode
  useVideoQualityCheck?: {
    open?: boolean
    valueDRC?: number | string
    onDRCChange?: (quality: string) => void
  }
  useDing?: boolean
  renderVideo?: boolean
  onAspectRatioChange?: (aspectRatio: number) => void
  onUavProperties?: (properties: PropertiesData) => void
  onClickSeiBox?: (box: AiObject) => void
  onVideoElementChange?: (videoElement: HTMLVideoElement | null) => void
}

type DeviceLiveVideoRefType = {
  /** 截图 */
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
        sn,
        useTopBar = true,
        useBottomBar = true,
        leftBottom,
        leftTop,
        rightBottom,
        rightTop,
        videoChildren,
        videoSafeAreaChildren,
        useVideoQualityCheck,
        useDing = true,
        renderVideo = true,
        onAspectRatioChange,
        onUavProperties,
        onClickSeiBox,
        onVideoElementChange,
      },
      ref,
    ) => {
      const { t } = useTranslation()
      const queryClient = useQueryClient()

      const [fetchTime, setFetchTime] = useState(0)
      const { data, refetch } = useQuery(
        {
          queryKey: ['getVideoUrl', { productKey, deviceId, videoId }],
          queryFn: async () => {
            try {
              // 同时获取视频直播地址和流列表
              const [liveData, streamList] = await Promise.all([
                live(productKey, deviceId, { videoId }),
                getDeviceStreamList({
                  streamId: `${productKey}/${deviceId}`,
                }),
              ])

              setFetchTime(Date.now())
              let url = (liveData.data.playUrl as string) || ''

              // 记忆化获取上次的流
              const last = sessionStorage.getItem(deviceId + '-videoURL')
              if (last) {
                const find = streamList.data.find((e) => e.playUrl === last)
                if (find) {
                  url = find.playUrl
                }
              }
              return {
                url,
                streamList: streamList.data,
              }
            } catch (error) {
              console.error(error)
              return {
                url: '',
                streamList: [],
              }
            }
          },
        },
        queryClient,
      )

      const [jessibucaKey, setJessibucaKey] = useState(0)
      const playUrl = data?.url
      const streamList = data?.streamList

      const [url, setUrl] = useState(playUrl ?? '')

      useEffect(() => {
        setUrl(playUrl ?? '')
      }, [playUrl])

      const [aspectRatio, setAspectRatio] = useState(16 / 9)
      const [ts, _setTs] = useState(0)
      const { run: setTs } = useThrottleFn(
        (t: number) => {
          debounceRetch()
          _setTs(t)
        },
        { wait: 333 },
      )

      /** 刷新 */
      const handleRefresh = async () => {
        await refetch()
      }

      const wrapperRef = useRef<HTMLDivElement>(null)
      const [fullScreen, { toggleFullscreen }] = useFullscreen(wrapperRef)

      const videoBoxRef = useRef<HTMLDivElement>(null)
      const size = useSize(videoBoxRef)

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

      // 查询视频质量
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

      // const delay = (callback: () => void, delay: number) => {
      //   let timer: NodeJS.Timeout | null = null
      //   timer = setTimeout(() => {
      //     callback()
      //     timer && clearTimeout(timer)
      //     timer = null
      //   }, delay)
      // }

      // 电子放大
      const {
        enableScale,
        originCenter,
        tranformCss,
        handleDrewScaleEnd,
        setEnableScale,
      } = useElectricScale(fullScreen)

      /** 视频流切换 */
      const handleStreamChange = useMemoizedFn((value: string) => {
        if (url.indexOf('?') > -1) {
          value += url.substring(url.indexOf('?'))
        }
        setUrl(value)
      })

      /** 视频质量切换 */
      const handle5GChange = useMemoizedFn(async (value: string) => {
        const sid = calcStreamId(url)
        await setLiveQuality({
          qualityLevel: value,
          app: 'rtp',
          streamId: sid,
        })
        await queryClient.invalidateQueries({
          queryKey: ['getQualityLevel', 'rtp', sid],
        })
      })

      // 主要用于: 在没有更新 ts 时，重新拉流
      const { run: debounceRetch } = useDebounceFn(
        () => {
          refetch()
          debounceRetch()
        },
        { wait: 5000, leading: false },
      )

      useEffect(() => {
        debounceRetch()
      }, [])

      // 计算安全区相关
      const { safeY, topBar, bottomBar, videoWrapper } = useCalcSafeArea(size)

      const [aiData, setAIData] = useAIDataState()

      const finalUrl = useMemo(() => {
        if (url) {
          return url + `?t=-1&token=-1&tt=${fetchTime}`
        }
        return ''
      }, [url, fetchTime])

      console.log('finalUrl', finalUrl)

      return (
        <div
          className="size-full overflow-hidden relative bg-black text-sm"
          ref={wrapperRef}
          style={{ aspectRatio: aspectRatio }}
        >
          {/* 视频 SEI AI 检测 meta 信息 */}
          {Array.isArray(aiData?.displayMetaList) && (
            <SeiAIDataMetaInfo
              data={aiData.displayMetaList}
              videoWidth={size?.width}
            />
          )}
          <div
            className="absolute inset-0 m-auto max-w-full max-h-full"
            ref={videoWrapper}
            style={{
              aspectRatio: aspectRatio,
            }}
          >
            {/* 视频内容 */}
            <div
              ref={videoBoxRef}
              className={clsx('absolute inset-0 bg-black')}
              style={{
                aspectRatio: aspectRatio,
                transformOrigin: `${originCenter[0] * 100}% ${
                  originCenter[1] * 100
                }%`,
                transition: enableScale === 2 ? 'transform 0.3s' : undefined,
                transform:
                  enableScale === 2 && tranformCss
                    ? tranformCss
                    : 'translate(0px, 0px)',
              }}
            >
              {finalUrl && !sn && renderVideo && (
                <Jessibuca
                  key={jessibucaKey}
                  containerId={videoContainerId}
                  src={finalUrl}
                  onVideoInfo={(v) => {
                    const aspect = v.width / v.height
                    if (Math.abs(aspect - aspectRatio) > 1e-5) {
                      setAspectRatio(v.width / v.height)
                      onAspectRatioChange?.(v.width / v.height)
                    }
                  }}
                  onTimeUpdate={setTs}
                  onSeiAIData={setAIData}
                  onSeiProperties={onUavProperties}
                  onFetchError={handleRefresh}
                  onError={() => setJessibucaKey((prev) => prev + 1)}
                  onStreamEnd={handleRefresh}
                  onVideoElementChange={onVideoElementChange}
                />
              )}

              {sn && (
                <DaoTongPlayer
                  sn={sn}
                  containerId={videoContainerId}
                  onVideoInfo={({ videoRatio }) => {
                    if (Math.abs(videoRatio - aspectRatio) > 1e-5) {
                      setAspectRatio(videoRatio)
                      onAspectRatioChange?.(videoRatio)
                    }
                  }}
                />
              )}

              {/* 视频绘制框 */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                {aiData && (
                  <SeiAIData data={aiData} onClickSeiBox={onClickSeiBox} />
                )}
                {enableScale === 1 && (
                  <DrawBox onDrawEnd={handleDrewScaleEnd} />
                )}
                {videoChildren}
                {videoSafeAreaChildren && (
                  <div
                    className="absolute inset-x-0"
                    style={{ top: `${safeY[0]}px`, bottom: `${safeY[1]}px` }}
                  >
                    {videoSafeAreaChildren}
                  </div>
                )}
              </div>
            </div>
          </div>
          <ConfigProvider
            theme={{
              cssVar: {
                key: 'dushu',
              },
              hashed: false,
              components: {
                Select: {
                  paddingSM: 0,
                },
              },
            }}
          >
            {/* 上工具栏 */}
            {useTopBar && (leftTop || rightTop || useDing) && (
              <aside
                ref={topBar}
                className="absolute inset-x-0 bg-[#1c2630] bg-opacity-70 p-1 px-2 h-8 backdrop-blur-sm"
              >
                <div className="flex justify-between items-center h-full">
                  <section className="flex items-center gap-3">
                    {leftTop}
                  </section>
                  <section className="flex items-center gap-3">
                    {useDing && (
                      <VideoDing
                        productKey={productKey}
                        deviceId={deviceId}
                        videoId={videoId}
                      />
                    )}
                    {rightTop}
                  </section>
                </div>
              </aside>
            )}
            {/* 下工具栏 */}
            {useBottomBar && (
              <aside
                ref={bottomBar}
                className="absolute bottom-0 inset-x-0 bg-[#1c2630] bg-opacity-70 p-1 px-2 h-8 z-30 backdrop-blur-sm"
              >
                <div className="flex justify-between items-center h-full">
                  <section className="flex items-center gap-3">
                    <div className="text-fore text-xs">{formatTs(ts)}</div>
                    {Array.isArray(streamList) && streamList.length > 1 && (
                      <VideoStream
                        currentUrl={url}
                        streamList={streamList!}
                        deviceId={deviceId}
                        onChange={handleStreamChange}
                      />
                    )}
                    {+videoQuality >= 0 && (
                      <VideoQuality5G
                        value={videoQuality}
                        onChange={handle5GChange}
                      />
                    )}
                    {videoQuality == -1 &&
                      !isNil(useVideoQualityCheck?.valueDRC) && (
                        <VideoQualityDRC
                          value={useVideoQualityCheck.valueDRC ?? 'Unknown'}
                          onChange={useVideoQualityCheck?.onDRCChange}
                        />
                      )}
                    {leftBottom}
                  </section>
                  <section className="flex items-center gap-3">
                    <IconButton
                      toolTipProps={{
                        title: t('common.refresh'),
                        getPopupContainer: () =>
                          (document.fullscreenElement as HTMLElement) ??
                          document.body,
                      }}
                      className="order-20 text-[13px]"
                      onClick={handleRefresh}
                    >
                      <IconRefresh />
                    </IconButton>
                    {globalConfig.enableElectricScale && (
                      <IconButton
                        className="scale-90"
                        toolTipProps={{ title: t('video.electricScale.title') }}
                        active={!!enableScale}
                        onClick={() => {
                          setEnableScale(1 - Math.sign(enableScale))
                        }}
                      >
                        <ExpandOutlined />
                      </IconButton>
                    )}
                    <IconButton
                      toolTipProps={{
                        title: !fullScreen
                          ? t('common.fullScreen')
                          : t('common.exit'),
                        align: {
                          offset: [-20, -10],
                        },
                        getPopupContainer: () =>
                          (document.fullscreenElement as HTMLElement) ??
                          document.body,
                      }}
                      className="order-20 text-[13px]"
                      onClick={toggleFullscreen}
                    >
                      {!fullScreen ? <IconFull /> : <FullscreenExitOutlined />}
                    </IconButton>
                    {rightBottom}
                  </section>
                </div>
              </aside>
            )}
          </ConfigProvider>
        </div>
      )
    },
  ),
)

DeviceLiveVideo.displayName = 'DeviceLiveVideo'

export default DeviceLiveVideo
